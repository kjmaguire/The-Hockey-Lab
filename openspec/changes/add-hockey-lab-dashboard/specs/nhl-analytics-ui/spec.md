## ADDED Requirements
### Requirement: The Hockey Lab branding
The system SHALL display the name "The Hockey Lab" in the primary UI header.

#### Scenario: App load
- **WHEN** the app loads
- **THEN** the header shows "The Hockey Lab"

### Requirement: Multi-view navigation
The system SHALL provide top-level views for Overview, Teams, Players, Games, and Analytics.

#### Scenario: View selection
- **WHEN** a user selects a view from navigation
- **THEN** the system displays the selected view

### Requirement: Season selection
The system SHALL allow selection between the 2024-25 and 2025-26 seasons.

#### Scenario: Season toggle
- **WHEN** a user changes the season selector
- **THEN** the view updates to show the selected season's data

### Requirement: Charts and tables
The system SHALL render line trend charts, bar comparison charts, and tables for skater, goalie, and team datasets.

#### Scenario: Analytics view
- **WHEN** a user opens the Analytics view
- **THEN** the system shows line, bar, and tabular displays for the selected dataset

### Requirement: UI filtering and pagination controls
The system SHALL provide UI controls for filtering, search, and pagination in table views.

#### Scenario: Paginated results
- **WHEN** a user navigates to the next page of results
- **THEN** the table updates to show the next page
