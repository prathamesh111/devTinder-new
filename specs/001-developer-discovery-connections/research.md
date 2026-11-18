# Research: Developer Discovery and Connections

**Date**: 2026-11-18
**Scope**: Express 5, Mongoose/MongoDB request consistency and the clarified feature constraints.

## Decisions

### Store one record per unordered member pair

**Decision**: Keep directional `fromUserId` and `toUserId` fields and derive canonical
`pairLowUserId`/`pairHighUserId` fields by sorting the two user IDs. Enforce a unique compound
MongoDB index on the canonical pair.

**Rationale**: A preliminary lookup followed by an insert cannot prevent two concurrent writes
from creating opposite-direction requests. A database unique index is the final concurrency
guard. The canonical pair also prevents a second request after acceptance or rejection because
the terminal record remains in place.

**Alternatives considered**:

- Keep only the existing directional index: rejected because opposite-direction pairs remain
  distinct and the index is not unique.
- Rely only on a Mongoose pre-insert lookup: rejected because concurrent requests can both pass
  the lookup before either insert completes.
- Auto-accept reciprocal requests: rejected because the feature explicitly says the recipient
  decides on the existing request.

### Make request decisions conditional and atomic

**Decision**: Update a request only when its ID matches, the authenticated member is its
`toUserId`, and its current status is pending (`interested` in the existing storage/API terms).
Change the state to `accepted` or `rejected` in one single-document update.

**Rationale**: The update filter enforces recipient-only authorization and prevents a concurrent
or repeated decision from overwriting a terminal state. Use Mongoose `findOneAndUpdate()` with
`returnDocument: "after"` and `runValidators: true`.

**Alternatives considered**:

- Read, mutate, and save without a state predicate: rejected because concurrent decisions can
  overwrite each other.
- Use a multi-document transaction: unnecessary for a one-document state transition and unique
  pair insert.

### Handle uniqueness races as conflicts

**Decision**: Treat a duplicate-key error on the canonical pair index as a conflict. For a
reciprocal pending request, return enough existing-request information for the recipient to
respond to that request; do not insert a second request.

**Rationale**: MongoDB's unique index decides the winner when submissions race. HTTP `409 Conflict`
is appropriate when a request conflicts with the pair's existing relationship state.

### Migrate and audit the index deliberately

**Decision**: Before relying on the unique index, backfill canonical pair fields and audit
unordered duplicates. Stop with an actionable report if duplicates exist; require an explicit
resolution rather than deleting or merging data automatically. Build the unique index before
enabling writes under the new behavior.

**Rationale**: MongoDB cannot create a unique index while duplicate index keys exist. The current
repository has a non-unique, direction-sensitive index only. Mongoose recommends managing
production index creation deliberately rather than relying on automatic startup index creation.

### Keep Express 5 errors explicit and non-sensitive

**Decision**: Use Express 5's async error forwarding and a shared final error handler. Map
validation errors to `400`, missing authentication to `401`, missing resources to `404`,
duplicate/state conflicts to `409`, and unexpected failures to a generic `500` response. Do not
send raw database or token errors to clients.

**Rationale**: Express 5 forwards rejected route-handler promises to error middleware. A shared
handler enables consistent API responses without exposing internal details.

### Preserve project decisions and avoid new dependencies

**Decision**: Use the existing Express 5, Mongoose 9, MongoDB, cookie JWT authentication, and
CommonJS code style. Follow `package.json` for Node.js version if declared; the current root
manifest has no `engines.node`. Do not add email verification or a daily request cap. Do not plan
unit or end-to-end tests.

**Rationale**: These are explicit project and user constraints. The repository already has the
needed runtime and persistence dependencies.

## Existing Behavior to Preserve

- Existing endpoint paths and cookie-based authentication remain stable.
- Existing `interested` storage status represents a pending request; accepted and rejected are
  terminal states.
- The existing `ignored` status is legacy behavior, not a new user flow in this feature. Its
  compatibility handling must not create pending requests or connections.
- Feed pagination defaults to 10 and is capped at 50.
- Public profile projections omit email and credentials; own-account responses may include
  account fields but never a password hash.

## References

- [MongoDB: Unique Indexes](https://www.mongodb.com/docs/manual/core/index-unique/)
- [MongoDB: Atomicity and Write Filters](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
- [MongoDB: Unique Index Restrictions](https://www.mongodb.com/docs/manual/core/index-unique/#restrictions)
- [Mongoose: Schema Indexes](https://mongoosejs.com/docs/guide.html#indexes)
- [Mongoose: `findOneAndUpdate()`](https://mongoosejs.com/docs/tutorials/findoneandupdate.html)
- [Mongoose: Update Validators](https://mongoosejs.com/docs/validation.html#update-validators)
- [Express 5: Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Express 5: Response API](https://expressjs.com/en/5x/api/response.html#res.status)
- [RFC 9110: 409 Conflict](https://www.rfc-editor.org/rfc/rfc9110.html#name-409-conflict)
