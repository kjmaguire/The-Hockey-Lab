## ADDED Requirements
### Requirement: Game detail shows team logos
The game detail page SHALL show team logos for home and away teams when available.

#### Scenario: Logos available
- **WHEN** standings data includes team logo URLs for the game teams
- **THEN** the game detail view shows those logos.

#### Scenario: Logos unavailable
- **WHEN** team logo URLs are unavailable
- **THEN** the game detail view falls back to team initials.
