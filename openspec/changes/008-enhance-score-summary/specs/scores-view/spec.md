## ADDED Requirements
### Requirement: Scoring summary is ordered
The game detail page SHALL display scoring summary items ordered by period and time.

#### Scenario: Ordered summary
- **WHEN** scoring summary items include period/time values
- **THEN** the list is ordered by period and game time.

### Requirement: Scoring summary highlights goal types
The game detail page SHALL display goal type badges (PP, SH, EN, OT) when available.

#### Scenario: Goal type available
- **WHEN** a scoring summary item includes a goal type code
- **THEN** the UI shows the corresponding badge.

#### Scenario: Goal type missing
- **WHEN** a scoring summary item has no goal type code
- **THEN** no badge is shown.
