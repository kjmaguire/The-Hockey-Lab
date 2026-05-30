## ADDED Requirements
### Requirement: Schedule cards resolve to gamecenter ids
The Scores page SHALL resolve schedule games to gamecenter ids using a fallback match if needed.

#### Scenario: Direct match
- **WHEN** a schedule game id matches a gamecenter id
- **THEN** the card links using the schedule id.

#### Scenario: Fallback match
- **WHEN** a schedule game id does not match but team+start time match a gamecenter game
- **THEN** the card links using the matched gamecenter id.
