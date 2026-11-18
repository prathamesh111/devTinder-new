# Data Model: Developer Discovery and Connections

## Member Account

Represents a developer's private account and sign-in identity. In the current application this
entity is the Mongoose `User` document.

| Field | Constraints and use |
|---|---|
| `_id` | MongoDB identifier; used as the member identity and connection endpoint |
| `firstName` | Required; trimmed; 2-30 characters |
| `lastName` | Required; trimmed |
| `email` | Required; normalized to lowercase and trimmed; unique; valid email format |
| `password` | Required credential hash; never returned in API responses |
| `age` | Optional; 18-99 when supplied |
| `gender` | Optional profile field |
| `photoUrl` | Optional profile field; valid URL when supplied |
| `about` | Optional profile text |
| `skills` | Profile skill list |
| `createdAt`, `updatedAt` | Persistence timestamps |

Email ownership verification is not required. The account and developer profile remain one
document; the public profile is an allowlisted projection, not a separate entity or collection.

## Developer Profile

A public view of a Member Account containing only information intended for discovery. The initial
projection follows the existing safe-field allowlist: first name, last name, age, photo URL,
gender, and skills. Email and password credentials are excluded. The initial feature does not add
profile editing or new profile fields.

## Connection Request

Represents a directed request and, through its canonical pair, the relationship history between
two distinct members.

| Field | Constraints and use |
|---|---|
| `_id` | MongoDB request identifier |
| `fromUserId` | Required reference to the member who initiated the request |
| `toUserId` | Required reference to the recipient; only this member may decide |
| `pairLowUserId` | Lower of the two member identifiers in a stable canonical ordering |
| `pairHighUserId` | Higher of the two member identifiers in the same ordering |
| `status` | `interested` (pending), `accepted`, or `rejected`; `ignored` is retained only for legacy records/clients |
| `createdAt`, `updatedAt` | Persistence timestamps |

### Relationships and invariants

- `fromUserId` and `toUserId` both reference Member Accounts and MUST differ.
- `pairLowUserId` and `pairHighUserId` are derived from those IDs on every write; callers cannot
  choose them.
- A unique compound index on `{ pairLowUserId, pairHighUserId }` permits at most one stored
  request record per unordered member pair.
- The sender creates a request in the existing `interested` state, which means pending.
- Only the recipient may transition `interested` to `accepted` or `rejected`.
- `accepted` and `rejected` are terminal. An accepted request is the source of the connection
  visible to both members; no separate Connection collection is required.
- A rejected pair cannot create another request in either direction.
- A reciprocal submission while a request is pending returns the existing request for the
  recipient to decide; it does not create a second record.
- No daily quota is applied. Self-requests, duplicate/pair requests, and requests to existing
  connections remain prohibited.
- Existing `ignored` behavior is preserved only as compatibility behavior. It is not a new
  pending, accepted, or rejected transition.

## Indexes

- `User.email`: unique index (already present).
- `ConnectionRequest.pairLowUserId, pairHighUserId`: unique compound index (planned).
- `ConnectionRequest.toUserId, status, createdAt`: supports the recipient's pending request list.
- Keep or replace the current directional index only after confirming query plans for request and
  connection lookups.

## Migration and Concurrency

1. Audit existing request documents and derive the canonical pair for each record.
2. Report any duplicate unordered pairs and stop without deleting or merging documents.
3. Backfill canonical pair fields for unique pairs.
4. Build the unique compound index before enabling request writes under the new behavior.
5. On concurrent duplicate insert, handle the unique-index violation as a `409 Conflict`.
6. Make recipient decisions with a single conditional update filtered by request ID, recipient
   ID, and current pending state. Use `runValidators: true` and return the updated document.

No multi-document transaction is required for a single request insertion or state transition.
