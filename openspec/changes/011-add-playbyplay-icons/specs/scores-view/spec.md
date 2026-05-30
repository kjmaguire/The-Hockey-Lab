## ADDED Requirements
### Requirement: Play-by-play shows event icons
The game detail page SHALL show icons for goal, penalty, and shot events.

#### Scenario: Goal event
- **WHEN** an event is categorized as a goal
- **THEN** the list shows the goal icon.

#### Scenario: Penalty event
- **WHEN** an event is categorized as a penalty
- **THEN** the list shows the penalty icon.

#### Scenario: Shot event
- **WHEN** an event is categorized as a shot
- **THEN** the list shows the shot icon.

#### Scenario: Other events
- **WHEN** an event is not a goal, penalty, or shot
- **THEN** no icon is shown.
