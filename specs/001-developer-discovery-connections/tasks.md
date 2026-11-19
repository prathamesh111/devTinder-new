# Tasks: Developer Discovery and Connections

**Input**: Design documents from `/specs/001-developer-discovery-connections/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: No unit or end-to-end tasks are included because the project constitution and feature plan explicitly prohibit them.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm shared project structure and API implementation surfaces.

- [ ] T001 Review existing Express entry point and route mounting in src/app.js
- [ ] T002 [P] Review existing account, discovery, request, and shared validation modules in src/routes/ src/models/ src/middlewares/ and src/utils/
- [ ] T003 Create scripts/ directory for the connection-request pre-deployment migration
- [ ] T004 [P] Document the feature API endpoints and response shapes from contracts/openapi.yaml in apiList.md

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared persistence, authorization, error, and migration infrastructure required by every user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Extend src/models/user.js with the canonical public/account field allowlists and preserve `User.email` per data-model.md `Member Account.email`, plus safe omission of `Member Account.password`
- [ ] T006 Extend src/models/connectionRequests.js with `Connection Request.pairLowUserId` and `Connection Request.pairHighUserId`, derive both fields on every write, and keep `Connection Request.fromUserId`, `Connection Request.toUserId`, and `Connection Request.status` constraints per data-model.md
- [ ] T007 [P] Add the unordered-pair unique index and request recipient/status index to src/models/connectionRequests.js
- [ ] T008 [P] Implement src/middlewares/errorHandler.js with consistent 400, 401, 404, 409, and generic 500 API error shapes
- [ ] T009 Mount the shared error middleware after all routes in src/app.js and remove raw error-detail forwarding
- [ ] T010 [P] Refactor src/middlewares/auth.js to return a structured 401 for missing or invalid cookies and preserve req.user as an authenticated member
- [ ] T011 [P] Implement src/services/connectionRequests.js for pair canonicalization, duplicate-key conflict handling, reciprocal-pending lookup, and recipient-only conditional decisions
- [ ] T012 Create scripts/migrate-connection-request-pairs.js to audit duplicate unordered pairs, stop on duplicates, backfill unique-pair fields, and build the unique index before request writes
- [ ] T013 [P] Update src/utils/validation.js so signup and profile inputs enforce `Member Account.firstName`, `Member Account.lastName`, `Member Account.email`, `Member Account.password`, `Member Account.age`, `Member Account.photoUrl`, and `Member Account.gender` constraints from data-model.md

**Checkpoint**: Foundation ready - account, discovery, and connection stories can proceed.

---

## Phase 3: User Story 1 - Create an Account and Sign In (Priority: P1)

**Goal**: Let a visitor create and sign in to a member account without exposing credentials or requiring email verification.

**Independent Test**: A visitor can register with valid unused details, receive a token cookie, sign in with the same credentials, read only the safe own-account view, and receive generic failures for duplicate or invalid credentials.

- [ ] T014 [US1] Update POST /signup in src/routes/auth.js to validate `Member Account.firstName`, `Member Account.lastName`, `Member Account.email`, and `Member Account.password` as defined in data-model.md, hash the password, set the token cookie, and return 201 account data
- [ ] T015 [US1] Add duplicate-email conflict handling in src/routes/auth.js for `Member Account.email` and return a generic 409 without credential details
- [ ] T016 [US1] Update POST /login in src/routes/auth.js to validate `Member Account.email` and `Member Account.password` per data-model.md and return a generic 401 for unknown email or invalid password
- [ ] T017 [P] [US1] Update POST /logout in src/routes/auth.js to clear the token cookie with the configured cookie options
- [ ] T018 [P] [US1] Update GET /profile in src/routes/profile.js to return an account view that includes only allowed member fields and never `Member Account.password`
- [ ] T019 [P] [US1] Update profile editing in src/routes/profile.js and src/utils/validation.js so only `Member Account.age`, `Member Account.gender`, `Member Account.photoUrl`, `Member Account.firstName`, `Member Account.lastName`, and `Member Account.about` are editable per data-model.md
- [ ] T020 [US1] Keep profile password changes in src/routes/profile.js compatible with `Member Account.password` validation while ensuring the route never returns a password hash

**Checkpoint**: User Story 1 is complete and can be validated independently.

---

## Phase 4: User Story 2 - Discover Developers (Priority: P2)

**Goal**: Let an authenticated member browse safe public profiles other than their own, with clear empty and pagination behavior.

**Independent Test**: An authenticated member receives only the public profile allowlist on page 1, never receives their own profile, receives an empty array for no matches, and an unauthenticated member receives 401.

- [ ] T021 [P] [US2] Update GET /feed in src/routes/user.js to select public fields only: `Developer Profile.firstName`, `Developer Profile.lastName`, `Developer Profile.age`, `Developer Profile.photoUrl`, `Developer Profile.gender`, and `Developer Profile.skills` per data-model.md
- [ ] T022 [US2] Apply page and limit validation in src/routes/user.js for feed pagination with limit capped at 50 and default page/limit values from contracts/openapi.yaml
- [ ] T023 [US2] Exclude the authenticated member and pair-associated members from GET /feed in src/routes/user.js while preserving a clear empty `data: []` response
- [ ] T024 [P] [US2] Ensure unauthenticated feed access in src/middlewares/auth.js and src/routes/user.js returns the shared 401 error shape without member or connection data

**Checkpoint**: User Stories 1 and 2 are independently functional.

---

## Phase 5: User Story 3 - Manage Connection Requests (Priority: P2)

**Goal**: Provide pending, accepted, and rejected pair relationships with recipient-only decisions and database-guarded uniqueness.

**Independent Test**: A member can send a pending request, the recipient can list and accept or reject it, accepted pairs appear for both members, rejected or repeated decisions do not create connections, reciprocal/self/duplicate/terminal requests receive clear 400/409 outcomes, and no daily quota is applied.

- [ ] T025 [P] [US3] Implement POST /request/send/:status/:userId in src/routes/requests.js using `Connection Request.fromUserId`, `Connection Request.toUserId`, `Connection Request.status`, and `Connection Request.pairLowUserId` / `Connection Request.pairHighUserId` invariants from data-model.md
- [ ] T026 [US3] Reject self-requests and invalid identifiers with 400 in src/routes/requests.js and src/services/connectionRequests.js
- [ ] T027 [US3] Implement canonical pair lookup and unique insert behavior in src/services/connectionRequests.js and src/models/connectionRequests.js, including 409 conflict for duplicate or concurrent pair writes
- [ ] T028 [US3] On reciprocal pending submission in src/routes/requests.js and src/services/connectionRequests.js, return the existing request in `existingRequest` instead of creating a second record
- [ ] T029 [US3] Preserve terminal-pair behavior in src/services/connectionRequests.js and src/routes/requests.js so accepted or rejected pairs cannot receive a new request
- [ ] T030 [US3] Implement POST /request/review/:status/:requestId in src/routes/requests.js and src/services/connectionRequests.js with a conditional update filtered by `Connection Request._id`, `Connection Request.toUserId`, and pending `Connection Request.status`
- [ ] T031 [US3] Accept only `accepted` or `rejected` review statuses in src/routes/requests.js and preserve the terminal decision so repeated decisions return 409
- [ ] T032 [P] [US3] Update GET /users/requests/received in src/routes/user.js to return pending requests with safe populated sender profiles and a clear empty list
- [ ] T033 [US3] Update GET /user/connections in src/routes/user.js to derive connections only from `Connection Request.status = accepted` and return a safe profile for the other member
- [ ] T034 [P] [US3] Update src/routes/requests.js and src/routes/user.js to use shared structured errors and preserve existing HTTP paths for send, review, received, and connections

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure consistency, startup behavior, API documentation, and migration readiness across the feature.

- [ ] T035 [P] Remove password and secret fields from every public/profile response in src/routes/auth.js, src/routes/profile.js, src/routes/user.js, and src/routes/requests.js
- [ ] T036 [P] Verify the POST /signup, POST /login, GET /feed, and connection routes match contracts/openapi.yaml and update specs/001-developer-discovery-connections/contracts/openapi.yaml if needed
- [ ] T037 [P] Synchronize endpoint and status documentation in apiList.md with the implemented auth, discovery, and connection routes
- [ ] T038 Update src/app.js startup sequencing so migration is not silently required at request time and document the deliberate pre-deployment migration step in specs/001-developer-discovery-connections/quickstart.md
- [ ] T039 Run a local application startup check using specs/001-developer-discovery-connections/quickstart.md, without adding or executing unit or end-to-end tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in priority order or in parallel when staffed
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2); no dependency on discovery or connection stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); no dependency on US1 implementation beyond shared auth
- **User Story 3 (P2)**: Can start after Foundational (Phase 2); can reuse account/profile surfaces but must remain independently testable

### Within Each User Story

- Foundational models and services precede story route work
- Account route updates precede independent account validation
- Discovery projection and feed filtering are independent after auth foundation
- Request model/service work precedes send and review routes
- Core implementation precedes documentation/polish
- Stop at each checkpoint and validate the story independently

## Parallel Opportunities

- Setup tasks T002 and T004 can run in parallel
- Foundational model, middleware, service, auth, migration, and validation tasks T005-T013 can be split across files once T005/T006 define schemas
- US1 account response tasks T017-T020 can run in parallel after T014-T016 establish route conventions
- US2 feed projection, pagination, filtering, and auth checks T021-T024 can be implemented by separate file-focused tasks
- US3 send, reciprocal, review, received-list, connection-list, and error tasks T025-T034 can run in parallel where separate file boundaries allow
- Polish documentation and response allowlist tasks T035-T38 can run in parallel

## Parallel Example: User Story 1

```text
T017 Update logout cookie handling in src/routes/auth.js
T018 Add safe own-account profile view in src/routes/profile.js
T019 Update profile field allowlists in src/routes/profile.js and src/utils/validation.js
T020 Keep password updates safe in src/routes/profile.js
```

## Parallel Example: User Story 2

```text
T021 Add safe feed profile projection in src/routes/user.js
T022 Add feed pagination validation in src/routes/user.js
T024 Add structured unauthenticated feed handling in src/middlewares/auth.js
```

## Parallel Example: User Story 3

```text
T025 Implement request send route in src/routes/requests.js
T032 Populate received requests safely in src/routes/user.js
T033 Build accepted connections in src/routes/user.js
T034 Standardize request route errors in src/routes/requests.js and src/routes/user.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate account registration, sign-in, profile access, and safe credential handling independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and validate account access
3. Add User Story 2 and validate discovery independently
4. Add User Story 3 and validate request/connection behavior independently
5. Complete polish and migration documentation

### Parallel Team Strategy

1. Complete Setup and Foundational together
2. After the foundation is complete:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Each story completes before integration/polish; cross-story work is kept at shared auth and model boundaries

## Notes

- [P] tasks = different files or independent implementation surfaces with no dependency on incomplete tasks
- [Story] label maps implementation work to its user story
- Every task includes a specific file path
- No test framework, test suite, test script, unit test, or end-to-end test should be added
- Commit after each task or logical group
