## ADDED Requirements
### Requirement: Score cards show game type
The Scores page SHALL show a game type label for each game when the schedule payload provides a gameTypeId.

#### Scenario: Regular season label
- **WHEN** a game has gameTypeId 2
- **THEN** the game card shows "Regular season".

#### Scenario: Playoff label
- **WHEN** a game has gameTypeId 3
- **THEN** the game card shows "Playoffs".

#### Scenario: Preseason label
- **WHEN** a game has gameTypeId 1
- **THEN** the game card shows "Preseason".

#### Scenario: Missing game type
- **WHEN** a game does not provide a gameTypeId
- **THEN** the game card omits the game type label.

### Requirement: Score cards show broadcasts
The Scores page SHALL show broadcast network information when available in the schedule payload.

#### Scenario: Broadcasts available
- **WHEN** a game includes broadcast network labels
- **THEN** the game card lists the networks.

#### Scenario: Broadcasts missing
- **WHEN** a game has no broadcast network labels
- **THEN** the game card omits the broadcast line.
