## ADDED Requirements
### Requirement: Score cards show team logos
The Scores page SHALL show home and away team logos on each score card when available.

#### Scenario: Logos available
- **WHEN** standings data includes team logo URLs
- **THEN** the score card shows the home and away logos.

#### Scenario: Logos unavailable
- **WHEN** team logo URLs are not available
- **THEN** the score card omits logos and falls back to team initials.

### Requirement: Score cards show team records
The Scores page SHALL show team records (W-L-OT) when standings data is available.

#### Scenario: Records available
- **WHEN** standings data includes wins, losses, and OT losses
- **THEN** the score card shows each team record.

#### Scenario: Records unavailable
- **WHEN** standings data does not include record information
- **THEN** the score card omits the record line.
