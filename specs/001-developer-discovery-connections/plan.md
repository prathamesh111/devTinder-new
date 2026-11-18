# Implementation Plan: Developer Discovery and Connections

**Branch**: `main` (feature branch not created) | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification in `specs/001-developer-discovery-connections/spec.md`

## Summary

Extend the existing Express API to support member signup/sign-in, developer discovery, and
connection requests with recipient-only, one-time decisions. Keep the existing MongoDB/Mongoose
and cookie-authentication stack. Add an unordered unique pair index and atomic state transitions
so reciprocal or concurrent requests cannot create duplicate relationships. Preserve the existing
HTTP paths, document response and error contracts, and keep public profile responses free of
credentials. No unit or end-to-end testing is planned under the current constitution and the
user's resolution of the testing-policy conflict.

## Technical Context

**Language/Version**: CommonJS JavaScript on Node.js. The root `package.json` does not declare
`engines.node`; use the deployment runtime selected for this project without inventing a version
in the plan.

**Primary Dependencies**: Existing dependencies only: Express `^5.3.0`, Mongoose `^9.11.1`,
`bcrypt`, `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv`, and `validator`.

**Storage**: MongoDB through Mongoose. The existing `User` and `ConnectionRequest` collections
remain the persistence boundary; a separate Connection collection is not needed.

**Testing**: Unit and end-to-end tests MUST NOT be authored, run, required, or used as acceptance
gates. The constitution and the user's selected resolution govern this plan. No test framework or
test script will be added.

**Target Platform**: Node.js HTTP service; deployment and hosting platform are not present in the
repository and remain deployment concerns.

**Project Type**: Single backend web service.

**Performance Goals**: Support 1,000 concurrently active members using account access, discovery,
and connection-request features. The spec sets no API latency or availability objective.

**Constraints**: Keep Express.js and the CommonJS project style; do not add dependencies without
need. Use the existing HTTP paths and cookie authentication. Do not require email verification or
impose a daily request quota. A pair with a rejected or accepted request cannot create another
request. No unit or end-to-end testing.

**Scale/Scope**: Signup, sign-in, paginated developer feed, received requests, connection list,
and send/accept/reject flows for the first release. Feed page size remains capped at 50. Chat,
profile editing, email verification, and frontend work are outside this feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- **Clean Code and Minimal Dependencies**: PASS — build on the existing route, middleware,
  model, and utility modules; add no package dependency. Isolate connection lifecycle logic only
  because it has shared concurrency and state invariants.
- **Node.js and Express.js Runtime**: PASS — remain on Node.js and Express.js; defer to the
  package manifest where it specifies a runtime. The current root manifest has no `engines.node`.
- **API Development Standards**: PASS — preserve route paths, define status codes and consistent
  response/error shapes, validate inputs, and update `apiList.md` during implementation.
- **Security by Default**: PASS — keep cookie authentication and recipient authorization,
  validate input, and return allowlisted profile/account views without password hashes or secrets.
- **Express.js Backend Architecture**: PASS — keep startup, routes, middleware, models, and
  configuration in their existing roles; isolate pair-state decisions in a focused service.
- **Testing Constraint**: PASS — no unit or end-to-end tests, test suites, test scripts, or test
  gates are planned.
- **Governance**: PASS — review the implementation and API documentation against the constitution.

No constitution violations are identified.

### Post-Design Gate

PASS — the proposed design adds no dependencies or test suites, keeps the Express/Mongoose stack,
uses existing module boundaries with one narrowly scoped connection-request service, and includes
security-safe response contracts. The startup guide is not an end-to-end validation procedure.

## Project Structure

### Documentation (this feature)

```text
specs/001-developer-discovery-connections/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md                 # Created by /speckit-tasks, not by this command
```

### Source Code (repository root)

```text
src/
├── app.js
├── config/
│   ├── database.js
│   └── jwt.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js                 # Planned shared error mapping
├── models/
│   ├── user.js
│   └── connectionRequests.js
├── routes/
│   ├── auth.js
│   ├── profile.js
│   ├── requests.js
│   └── user.js
├── services/
│   └── connectionRequests.js           # Planned pair uniqueness and transitions
└── utils/
    └── validation.js

scripts/
└── migrate-connection-request-pairs.js  # Planned pre-deployment index/data preflight

apiList.md
```

**Structure Decision**: Extend the existing single backend. Keep route handlers responsible for
HTTP input/output, authentication in the existing middleware, persistence in Mongoose models,
and validation in existing utilities. A focused connection-request service is justified by the
pair canonicalization, duplicate-key handling, and terminal state transition rules. The migration
script is separate from application startup so the unique index is prepared before serving writes.

## Design Risks and Gates

- Before adding the pair-uniqueness index, audit existing request documents for duplicate
  unordered pairs. If any exist, stop the migration and require an explicit data-resolution
  decision; do not silently delete or merge records.
- Build and verify the unique index before application instances accept connection-request writes.
- The 1,000-concurrent-member target has no latency, availability, or recovery thresholds. These
  operational objectives remain open for deployment planning.
- The local quickstart documents startup only. Functional end-to-end validation is excluded by
  the current testing policy.
