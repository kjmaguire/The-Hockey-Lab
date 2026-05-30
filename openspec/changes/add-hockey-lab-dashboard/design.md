## Context
We are building a basic Streamlit site that reads NHL stats from `api-web.nhle.com` for two seasons and presents multi-view analytics.

## Goals / Non-Goals
- Goals: cached API ingestion for skater/goalie/team data, multi-view navigation, charts and tables, filtering/search/pagination.
- Non-Goals: live play-by-play updates, NHL EDGE data, real-time game streaming.

## Decisions
- Decision: Use a small API client module that normalizes skater, goalie, and team datasets into a consistent schema for UI consumption.
- Decision: Use Streamlit multi-page navigation for Overview, Teams, Players, Games, Analytics.
- Decision: Use `st.cache_data` with TTL plus an explicit refresh control for cache busting.

## Risks / Trade-offs
- API shape changes may break ingestion; mitigate with basic schema validation and cached fallbacks.
- Cached data may be stale; mitigate with visible last-updated timestamps and refresh.

## Migration Plan
- Initial release reads from cache + API for 2024-25 and 2025-26 seasons.
- Later: add live-game and NHL EDGE data as new capabilities.

## Open Questions
- Default cache TTL and max size.
- Exact filters for each view (team, position, opponent, date range).
