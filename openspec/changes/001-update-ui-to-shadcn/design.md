## Context
The current UI is implemented in Streamlit (app.py). The goal is to move to a Shadcn-based web UI while preserving existing functionality.

## Goals / Non-Goals
- Goals:
  - Provide a Shadcn-based UI with equivalent views and interactions
  - Maintain current data coverage (standings, leaders, schedule, analytics)
  - Establish a clear data access strategy for the web UI
- Non-Goals:
  - Expanding to new data sources in this change
  - Reworking NHL data normalization logic beyond what is required for the UI

## Decisions
- Decision: Frontend framework: Next.js
- Decision: Data access pattern: client-side calls to the NHL API
- Decision: Deployment target: local/dev only for this phase

## Risks / Trade-offs
- UI rewrite may delay feature work; mitigate by keeping parity scope small
- Direct client calls may face rate limits; mitigate with a proxy and caching

## Migration Plan
- Implement the Shadcn UI in parallel
- Validate feature parity with the Streamlit UI
- Switch primary UI entry point to the web app
- Retire the Streamlit UI or keep as an internal tool

## Open Questions
- Do we need authentication or rate-limit protection in this phase?
