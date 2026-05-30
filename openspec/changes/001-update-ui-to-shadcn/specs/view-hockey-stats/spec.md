## ADDED Requirements
### Requirement: View navigation
The system SHALL provide navigation between Overview, Teams, Players, Games, and Analytics views.

#### Scenario: Switch views
- **WHEN** a user selects a view from the navigation
- **THEN** the corresponding view is displayed

### Requirement: Season selection
The system SHALL allow users to select supported seasons.

#### Scenario: Select a season
- **WHEN** a user selects a season
- **THEN** data shown across views reflects that season

### Requirement: Data presentation
The system SHALL display standings, leaders, schedules, and analytics using tables and charts.

#### Scenario: View standings
- **WHEN** a user opens the Teams view
- **THEN** the standings table is displayed

### Requirement: Error and empty states
The system SHALL display a clear error or empty state when data cannot be loaded.

#### Scenario: Data error
- **WHEN** data retrieval fails
- **THEN** an error message is displayed to the user

### Requirement: Manual refresh
The system SHALL provide a control to refresh cached data.

#### Scenario: Refresh data
- **WHEN** a user triggers refresh
- **THEN** the UI reloads data from the source
