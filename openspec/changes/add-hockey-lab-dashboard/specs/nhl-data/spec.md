## ADDED Requirements
### Requirement: NHL API data ingestion
The system SHALL retrieve skater, goalie, and team datasets from `api-web.nhle.com` for the 2024-25 and 2025-26 seasons.

#### Scenario: Season data fetch
- **WHEN** a user selects a season and dataset type
- **THEN** the system returns the corresponding NHL API data

### Requirement: Cached data access
The system SHALL cache NHL API responses using a key derived from endpoint, season, and filters, and SHALL expose a manual refresh to bypass the cache.

#### Scenario: Cache hit
- **WHEN** a user requests data previously fetched within the cache TTL
- **THEN** the system serves the cached response

#### Scenario: Manual refresh
- **WHEN** a user triggers refresh
- **THEN** the system refetches from the API and updates the cache

### Requirement: Filtering, search, and pagination
The system SHALL support filtering and search for teams and players and SHALL paginate long tabular results.

#### Scenario: Filtered table
- **WHEN** a user applies a team or player filter and search query
- **THEN** the table updates and paginates the filtered results

### Requirement: API error handling
The system SHALL present a user-visible error message and use cached data when available if an API request fails.

#### Scenario: API failure with cache
- **WHEN** an API request fails and cached data exists
- **THEN** the system displays an error and renders cached data
