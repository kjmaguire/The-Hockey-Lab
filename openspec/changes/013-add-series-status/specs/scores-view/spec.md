## ADDED Requirements
### Requirement: Game detail shows series status
The game detail page SHALL display playoff series status when available in the score payload.

#### Scenario: Series status available
- **WHEN** the score payload includes series record or game number
- **THEN** the game detail page shows the series status.

#### Scenario: Series status missing
- **WHEN** no series data is provided
- **THEN** the series status section is omitted.
