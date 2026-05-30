## ADDED Requirements
### Requirement: Team leaders show headshots
The game detail page SHALL show leader headshots when available.

#### Scenario: Headshots available
- **WHEN** leader player data includes headshot URLs
- **THEN** the leader card shows the headshot.

#### Scenario: Headshots missing
- **WHEN** leader headshot URLs are missing
- **THEN** the leader card falls back to initials.
