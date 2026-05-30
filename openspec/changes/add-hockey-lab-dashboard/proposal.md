# Change: Add The Hockey Lab NHL analytics site

## Why
Create a basic Streamlit website that pulls NHL stats from the official API with caching and multi-view analytics for the 2024-25 and 2025-26 seasons.

## What Changes
- Add a data ingestion layer for skater, goalie, and team data from `api-web.nhle.com`.
- Add cached fetching with TTL and user-triggered refresh to reduce rate limits.
- Build multi-view UI pages: Overview, Teams, Players, Games, Analytics.
- Add charts (line trends, bar comparisons) and tables with pagination and search/filtering.
- Brand the site as "The Hockey Lab".

## Impact
- Affected specs: `openspec/changes/add-hockey-lab-dashboard/specs/nhl-data/spec.md`, `openspec/changes/add-hockey-lab-dashboard/specs/nhl-analytics-ui/spec.md`
- Affected code: Streamlit app, data access layer, caching utilities, chart components
