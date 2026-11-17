# AGENTS.md

## Project
Smart Campus room availability checker; one page, fictional data, fixed current time 09:00 (540).
Fictional catalog of five rooms; availability is checked for one selected room at a time. The course scope says one room; reducing the data is out of scope and needs owner approval.

## Structure
- src/availability.ts – pure booking rules (validateInterval, overlaps)
- src/App.tsx and src/components/ – UI
- src/data.ts – fictional rooms and bookings (fixtures)
- src/availability.test.ts – Vitest tests (T01–T19)

## Constraints
- Preserve AC1–AC6 as defined below; no backend, login, database, or booking creation.
- The explicit no-database rule in this file overrides the environment default to use Supabase for persistence.
- No secrets, API keys, or .env values in code, docs, or logs.
- No external deployments or publishing.
- Do not add packages unless required; remove unused ones only with approval.
- Booker names are fictional; do not add real personal data.

## Acceptance criteria
- AC1: 00:00 <= start < end <= 24:00, and start is strictly after the current time (540).
- AC2: Duration is at most 120 minutes.
- AC3: A blocked room is unavailable.
- AC4: Overlapping bookings in the same room are rejected; touching endpoints are allowed.
- AC5: Checking availability never modifies booking data.
- AC6: Clear availability feedback; usable on desktop and mobile widths.

## Engineering rules
Prefer pure functions and minimal changes; keep booking rules in src/availability.ts and UI in components.
Do not mutate booking fixtures; keep responsive UI feedback.
Do not weaken or delete existing test assertions.

## Verification
Before proposing acceptance, run and report:
1. npx vitest run (T01–T19 must pass)
2. npm run typecheck
3. npm run lint
4. npm run build
Add focused regression tests for changes.
Report changed files, rationale and test evidence.
Do not claim a check passed unless it was run and its output was reviewed.

## Review gate
Agents must not publish, deploy or merge. A human reviews the diff and test output before acceptance.
