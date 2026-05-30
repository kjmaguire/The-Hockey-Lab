## ADDED Requirements
### Requirement: League skater leaders
The system SHALL retrieve league-wide skater summary stats from the NHL stats API (`api.nhle.com/stats/rest/en`) for the requested season and game type and expose them for presentation in the UI.

#### Scenario: Skater leaders request
- **WHEN** a user requests skater leaders with a season and game type
- **THEN** the system returns the corresponding league-wide skater stats
