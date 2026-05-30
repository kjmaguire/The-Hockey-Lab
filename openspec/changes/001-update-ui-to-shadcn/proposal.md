# Change: Update UI to Shadcn

## Why
Move the Hockey Lab UI from Streamlit to a Shadcn-based web UI for a more flexible, production-ready frontend.

## What Changes
- Replace the Streamlit UI with a Shadcn-based web UI
- Introduce a frontend app and data layer suitable for the web UI
- Preserve the current feature set (Overview, Teams, Players, Games, Analytics)
- Standardize UI components for tables, charts, filters, and error states
- **BREAKING**: Streamlit UI is removed or retired as the primary UI

## Impact
- Affected specs: view-hockey-stats (new)
- Affected code: app.py, new frontend app, data layer/API
