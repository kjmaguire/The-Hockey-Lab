## ADDED Requirements
### Requirement: Score cards show per-period shots on goal
The Scores page SHALL show per-period shots on goal when the score/now payload provides them.

#### Scenario: Per-period shots available
- **WHEN** per-period shots are available for a game
- **THEN** the score card shows the shots per period alongside the linescore.

#### Scenario: Per-period shots missing
- **WHEN** per-period shots are not available for a game
- **THEN** the score card omits per-period shot detail.

### Requirement: Score cards show OT and SO labels
The Scores page SHALL label overtime and shootout periods explicitly when the score/now payload provides the period type.

#### Scenario: Overtime period
- **WHEN** a period is labeled as overtime
- **THEN** the score card uses an OT label for that period.

#### Scenario: Shootout period
- **WHEN** a period is labeled as a shootout
- **THEN** the score card uses an SO label for that period.

### Requirement: Score cards show neutral-site or special-event flags
The Scores page SHALL show neutral-site or special-event flags when the schedule payload provides them.

#### Scenario: Neutral-site game
- **WHEN** the schedule payload marks a game as neutral-site
- **THEN** the score card displays a neutral-site flag.

#### Scenario: Special-event game
- **WHEN** the schedule payload marks a game as a special event
- **THEN** the score card displays a special-event flag.

### Requirement: Score cards show broadcast metadata
The Scores page SHALL display broadcast metadata such as language and national/regional tags when provided in the schedule payload.

#### Scenario: Broadcast metadata available
- **WHEN** the schedule payload provides broadcast metadata
- **THEN** the score card displays the metadata along with the broadcast name.

### Requirement: Scores page shows all scheduled entries
The Scores page SHALL display all schedule days and games returned by the schedule endpoint.

#### Scenario: Multiple days and games
- **WHEN** the schedule payload includes multiple days or more than four games
- **THEN** the Scores page shows every returned day and game.
