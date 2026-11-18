<!--
Sync Impact Report
Version change: unversioned scaffold -> 1.0.0
Modified principles: none (the previous document contained template placeholders)
Added principles:
- Clean Code and Minimal Dependencies
- Node.js and Express.js Runtime
- API Development Standards
- Security by Default
- Express.js Backend Architecture
Added sections: Testing Constraint; Development Workflow
Removed sections: none
Follow-up TODO: confirm the original ratification date and replace TODO(RATIFICATION_DATE).
-->
# devTinder Constitution

## Core Principles

### I. Clean Code and Minimal Dependencies
Code MUST use clear names, focused modules, and direct control flow. Avoid duplication and
unnecessary abstractions. Add a production dependency only when existing project code or platform
capabilities cannot reasonably meet the requirement; changes introducing dependencies MUST
explain their purpose.

### II. Node.js and Express.js Runtime
The backend MUST use Node.js and Express.js. For each package, the Node.js version declared by
`engines.node` in its `package.json` MUST be used. This constitution does not establish a separate
Node.js version or override a package manifest.

### III. API Development Standards
HTTP endpoints MUST use appropriate methods, status codes, and resource-oriented routes. Request
inputs MUST be validated before use, and responses and errors MUST have clear, consistent shapes.
Changes to endpoint behavior MUST keep the API documentation in sync.

### IV. Security by Default
Every endpoint MUST enforce the authentication and authorization appropriate to its operation.
All untrusted input MUST be validated, secrets MUST remain outside source control and responses,
and errors MUST NOT disclose credentials, tokens, or internal stack details.

### V. Express.js Backend Architecture
Application startup and middleware composition belong in the application entry point; endpoint
handling belongs in route modules; cross-cutting request behavior belongs in middleware;
persistence belongs in models; and integration settings belong in configuration modules.
Reusable validation and other shared utilities MUST remain separate from endpoint-specific
behavior. Add architectural layers only when they materially clarify responsibilities.

## Testing Constraint

Unit tests and end-to-end tests MUST NOT be authored, executed, required, or made an acceptance
gate. Changes MUST NOT introduce test frameworks, test suites, or scripts for those test types.

## Development Workflow

API contract changes MUST update the project's API documentation. Implementation and review MUST
check conformance to these principles, including API behavior, security, dependency rationale,
runtime compatibility, and the Express.js module boundaries. Report deviations and obtain
maintainer approval before treating them as intentional.

## Governance

This constitution governs project development practices. Amendments MUST be reviewed and approved
by the project maintainer, update this document, explain their impact, and update the version.
Use semantic versioning: MAJOR for incompatible governance changes, MINOR for new principles or
materially expanded requirements, and PATCH for clarifications and non-semantic edits.
Implementation proposals and reviews MUST assess compliance with the constitution; approved
deviations MUST be documented with their rationale.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-11-18
