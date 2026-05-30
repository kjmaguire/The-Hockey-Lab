## ADDED Requirements
### Requirement: Score cards show live situation badges
The Scores page SHALL show live situation badges (PP, SH, EN, GP) when the live payload provides them.

#### Scenario: Power play
- **WHEN** the live payload indicates a team is on the power play
- **THEN** the score card shows a PP badge.

#### Scenario: Shorthanded
- **WHEN** the live payload indicates a team is shorthanded
- **THEN** the score card shows a SH badge.

#### Scenario: Empty net
- **WHEN** the live payload indicates an empty net
- **THEN** the score card shows an EN badge.

#### Scenario: Goalie pulled
- **WHEN** the live payload indicates a pulled goalie
- **THEN** the score card shows a GP badge.

#### Scenario: No live situation
- **WHEN** no live situation flags are available
- **THEN** the score card omits the badge.
