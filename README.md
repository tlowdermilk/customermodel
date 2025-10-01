# Interactive UX Roles Table

An interactive visualization tool for exploring different UX interaction patterns between humans and AI systems across varying levels of autonomy and focus areas.

## Overview

This application provides a comprehensive framework for understanding how users interact with AI tools across different contexts. It visualizes:

1. **UX Interaction Modes** - A 5x3 matrix showing different roles (Tool, Advisor, Co-Creator, Team-Mate, Delegate) across three focus areas (Code, Intent, Orchestration)
2. **Profile Presets** - Predefined user profiles (e.g., Enterprise Maintainer, AI-Native Product-Maker) with associated user characteristics
3. **Scenarios** - Specific tasks or contexts within each profile (e.g., Prototyping) with workflow visualizations
4. **Product Capabilities** - Highlights which interaction modes different AI products support
5. **Situational Factors** - Contextual factors that influence both user profiles and specific scenarios

## Table Structure

### Rows (UX Roles - Increasing Autonomy)
- **Tool** - Local, reactive, low autonomy; optimized for incremental assist
- **Advisor** - Choice-oriented, human-in-control; ideal for trust-building
- **Co-Creator** - Collaborative, high-context, medium autonomy
- **Team-Mate** - Goal-driven, semi-autonomous; mirrors human team dynamics
- **Delegate** - High autonomy, milestone-driven; ideal for scale and speed

### Columns (Focus Areas)
- **Code Focused** - Direct code generation and manipulation
- **Intent Focused** - Natural language goals and objectives
- **Orchestration Focused** - Multi-step workflows and agent coordination

### Cell Content
Each cell contains:
- **Signature** - Brief description of the interaction pattern
- **Sentences** - Five structured steps: Set Context, Generate/Act, Evaluate, Repair/Refine, Apply/Ship
- **Detail** - In-depth explanation (shown in flyout on hover)

## Features

### 1. Interactive Table
- **Hover to Expand** - Hover over any cell to see detailed steps
- **Flyout Details** - After 1 second of hovering, a detailed explanation appears
- **Smart Positioning** - Flyouts appear above cells in the last row to stay visible
- **Left-Aligned Text** - All content is left-aligned for readability

### 2. Profile Presets

**Purpose**: Define different user profiles with characteristic expertise levels, AI capabilities, and governance requirements.

**Default Presets**:
- **Enterprise Maintainer** - Seasoned professional working in enterprise environment with high governance needs
- **AI-Native Product-Maker** - Product-focused developer leveraging AI-first approaches with lower governance
- **Domain Expert Orchestrator** - Domain authority using orchestration tools with balanced oversight

**How to Use**:
1. Click a preset button to select that profile
2. The situational factors on the right show the profile's characteristics:
   - **Human Expertise** (0-100) - Developer's skill/confidence level
   - **AI Capability** (0-100) - How capable/reliable the AI tools are
   - **Governance & Safety** (0-100) - Compliance and safety requirements
3. Click the same button again to deselect
4. When a preset is selected, you can then select scenarios specific to that profile

**Edit Mode**:
1. Click "Edit" to enter edit mode
2. Use the dropdown to select which preset to modify
3. Click on the factor bars to adjust values for the selected preset
   - Click anywhere on a bar to set that value
   - Or use the input field that appears in edit mode
4. Use "Add" to create a new preset
5. Use "Rename" to change a preset's display name
6. Use "Delete" to remove a preset (and all its scenarios)
7. Click "Exit" to save changes and exit edit mode

**Collapsible Panel**: Click the panel header or the +/− button to collapse/expand. When collapsed, shows the currently selected preset.

**Persistence**: Preset definitions and factor values are saved to browser localStorage.

### 3. Scenarios

**Purpose**: Define specific workflows within each profile, showing how users navigate between interaction modes during particular tasks.

**Important**: Scenarios are **profile-specific**. Each profile preset has its own set of scenarios. You must select a Profile Preset first before scenarios will appear.

**Default Scenario**: Every profile has a "Prototyping" scenario by default (factors set to 50).

**How to Use**:
1. First, select a Profile Preset (e.g., "Enterprise Maintainer")
2. Scenarios for that preset will appear in the Scenarios panel
3. Click a scenario button to visualize the workflow:
   - **Numbered purple dots** appear on cells (1, 2, 3...) showing sequence
   - **Curved connecting lines** show the path between steps
   - **Purple highlighting** on selected cells
4. The situational factors on the right show context-specific values:
   - **Task Importance** (0-100) - How critical is this task?
   - **Task Complexity** (0-100) - How complex is this work?
   - **Codebase Maturity** (0-100) - How established is the codebase?
5. Click the same scenario button again to deselect and clear the visualization

**Workflow Visualization**:
- Lines curve to avoid passing through intermediate cells
- The order of cells matters - it represents the temporal sequence
- Numbers on dots show the exact order of the workflow
- The workflow is specific to the **combination** of preset + scenario

**Edit Mode**:
1. Ensure a Profile Preset is selected first
2. Click "Edit" to enter scenario edit mode
3. Use the dropdown to select which scenario to modify
4. Click cells **in order** on the table to build the workflow path
   - Each click adds the cell to the sequence
   - Click an existing numbered dot to remove it and all subsequent steps
5. Click on the factor bars to adjust contextual values for this specific scenario
6. Use "Add" to create a new scenario for the current preset
7. Use "Rename" to change a scenario's display name
8. Use "Delete" to remove a scenario (every preset must keep at least one scenario)
9. Click "Exit" to save changes and exit edit mode

**Collapsible Panel**: Click the panel header or the +/− button to collapse/expand. When collapsed, shows the currently selected scenario.

**Persistence**: Scenario workflows and factor values are saved to browser localStorage with composite keys (preset:scenario).

### 4. Product Capability Visualization

**Purpose**: Highlight which cells represent interaction patterns supported by specific AI products.

**Default Products**:
- GitHub Copilot Completions, NES
- spec-kit
- Cursor IDE
- Claude
- GitHub Copilot Agent Mode

**How to Use**:
1. Click any product button to select it
2. Relevant cells are highlighted in blue
3. Click the same button again to deselect and clear highlights
4. Only one product can be selected at a time

**Edit Mode**:
1. Click "Edit" to enter edit mode
2. Use the dropdown to select which product to modify
3. Click cells to toggle their selection (yellow highlighting)
4. Use "Add" to create a new product
5. Use "Rename" to change a product's display name
6. Use "Delete" to remove a product completely
7. Click "Exit" to save changes and exit edit mode
8. Existing mappings for the selected product are pre-loaded for easy modification

**Collapsible Panel**: Click the panel header or the +/− button to collapse/expand. When collapsed, shows the currently selected product.

**Persistence**: Product mappings are saved to browser localStorage and persist across page refreshes.

## Data Persistence

The application uses **two methods** for data persistence:

### 1. Browser localStorage (Automatic)
Data is automatically saved to browser localStorage when changes are made:

1. **Profile Presets** - User profile definitions and their characteristics
2. **Preset Factors** - The three factors (Expertise, AI Capability, Governance) for each preset
3. **Preset Metadata** - Display names for each preset
4. **Scenario Workflows** - The sequence of cells for each preset:scenario combination
5. **Scenario Factors** - The three factors (Importance, Complexity, Maturity) for each preset:scenario combination
6. **Scenario Metadata** - Display names for scenarios within each preset
7. **Product Capability Mappings** - Which cells each product lights up
8. **Product Metadata** - Display names for each product

**Storage Keys**: 
- `uxTablePresets` - Preset definitions (currently unused - presets don't have cell workflows)
- `uxTablePresetFactors` - Factor values for each preset
- `uxTablePresetMetadata` - Preset display names
- `uxTableWorkflows` - Scenario workflows (keyed by "preset:scenario")
- `uxTableScenarioFactors` - Factor values for each scenario (keyed by "preset:scenario")
- `uxTableScenarioMetadata` - Scenario names organized by preset
- `uxTableProductCapabilities` - Product cell mappings
- `uxTableProductMetadata` - Product display names

### 2. File-Based Storage (Manual)
You can export and import all scenario data to/from a JSON file:

**Export Data**:
- Click the "Export Data" button in the Data Management section
- A `ux-table-data.json` file will be downloaded
- This file contains all your customizations: presets, scenarios, workflows, and product mappings
- Share this file with team members or store it for backup

**Import Data**:
- Click the "Import Data" button
- Select a previously exported `ux-table-data.json` file
- All data will be loaded and displayed immediately
- A backup of current data is automatically created before import

**Create Backup**:
- Click "Create Backup" to save a snapshot of current data
- Backups are stored in localStorage with timestamps
- Up to 5 most recent backups are kept

**Restore Backup**:
- Click "Restore Backup" to view and restore from previous backups
- Select from a list of dated backups
- Current data will be replaced with the selected backup

**Important Notes**:
- localStorage data persists per browser/device
- Clearing browser data will reset to defaults
- File-based storage allows cross-browser and cross-device sharing
- Changes are saved automatically to localStorage when you click "Exit" in edit mode
- Scenarios are associated with presets using composite keys (e.g., "enterprise-maintainer:prototyping")
- The application loads from localStorage on startup; use Import to load from a file

## Customization

### Adding New Profile Presets

1. Click "Edit" in the Profile Presets section
2. Click "Add" button
3. Enter a name for the new preset
4. Adjust the three factor bars (Expertise, AI Capability, Governance) by clicking on them
5. A default "Prototyping" scenario is automatically created for the new preset
6. Click "Exit" to save

### Adding New Scenarios to a Preset

1. Select a Profile Preset first
2. Click "Edit" in the Scenarios section
3. Click "Add" button
4. Enter a name for the new scenario
5. Click cells in order on the table to define the workflow
6. Adjust the three factor bars (Importance, Complexity, Maturity) by clicking on them
7. Click "Exit" to save

### Adding New Products

1. Click "Edit" in the Product Capabilities section
2. Click "Add" button
3. Enter a name for the new product
4. Click cells to define which interaction modes the product supports
5. Click "Exit" to save

### Modifying Factor Values

**In the UI** (Recommended):
1. Enter edit mode for either Profile Presets or Scenarios
2. Select the preset/scenario to modify from the dropdown
3. Click directly on the colored bars to set values (0-100)
4. Or use the input fields that appear in edit mode
5. Click "Exit" to save

**In Code** (Advanced):
Edit the default data structures in the JavaScript:

```javascript
// Profile Preset Factors
const defaultPresetFactors = {
  'preset-key': {
    expertise: 75,      // 0-100
    aicapability: 60,   // 0-100
    governance: 85      // 0-100
  }
};

// Scenario Factors (keyed by "preset:scenario")
const defaultScenarioFactors = {
  'preset-key:scenario-key': {
    importance: 50,   // 0-100
    complexity: 50,   // 0-100
    maturity: 50      // 0-100
  }
};
```

## Technical Implementation

### Technologies Used
- **HTML5** - Structure and canvas for visualizations
- **CSS3** - Styling, animations, and responsive layout
- **Vanilla JavaScript** - All interactivity and state management
- **localStorage API** - Data persistence
- **Canvas API** - Drawing curved workflow lines

### Key Features
- **Smooth Animations** - 500ms ease-out transitions for all state changes
- **Responsive Design** - Adapts to different screen sizes
- **No Dependencies** - Pure vanilla JavaScript, no frameworks required
- **Real-time Preview** - Edit modes show live previews before saving

### Code Organization
- **Data Structures** - Separate objects for table data, products, scenarios, and factors
- **State Management** - Multiple edit modes with proper cleanup
- **Event Handling** - Delegated event listeners for efficiency
- **Animation** - RequestAnimationFrame for smooth visual updates

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Edge, Safari (latest versions)
- **Requirements**: 
  - JavaScript enabled
  - localStorage support
  - CSS3 support (flexbox, gradients, transitions)
  - Canvas API support

## Usage Tips

1. **Exploring the Table** - Start by hovering over cells to understand the different interaction patterns
2. **Understanding User Profiles** - Click a Profile Preset button to see typical user characteristics (expertise, AI capability, governance needs)
3. **Seeing Workflows** - Select a preset, then click a scenario button to visualize how that type of user approaches that specific task
4. **Understanding Context** - Watch both sets of situational factors:
   - **Preset factors** show the user's inherent characteristics
   - **Scenario factors** show the task-specific context
5. **Understanding Products** - Click product buttons to see which interaction patterns different tools support
6. **Collapsing Panels** - Click panel headers to collapse sections and save screen space
7. **Customizing** - Use edit modes to create your own presets, scenarios, and product mappings
8. **Workflow Hierarchy** - Remember: Profile Presets → Scenarios → Workflows (scenarios belong to presets)

## File Structure

```
index.html              - Main application file with UI and core functionality
data-storage.js         - Data management module for export/import functionality
ux-table-data.json      - Sample/template data file (can be customized)
README.md               - This documentation file
```

## Getting Started

1. Open `index.html` in a modern web browser
2. **Explore the table**: Hover over cells to see interaction pattern details
3. **Understand user profiles**: Click a Profile Preset button (e.g., "Enterprise Maintainer")
   - Notice the three factors on the right showing user characteristics
4. **See a workflow**: With a preset selected, click a Scenario button (e.g., "Prototyping")
   - Numbered purple dots and curved lines show the workflow path
   - Three scenario-specific factors appear on the right
5. **Compare products**: Click a Product Capability button to see which patterns that tool supports
6. **Customize**: Use edit modes to create your own presets, scenarios, and product mappings
   - Click "Edit" buttons to enter edit mode
   - Use "Add", "Rename", "Delete" buttons to manage items
   - Click "Exit" to save and exit edit mode
7. **Save your work**: Use the Data Management section to export your customizations
   - Click "Export Data" to save all changes to a file
   - Click "Import Data" to load previously saved data
   - Create backups before making major changes

## Understanding the Hierarchy

The application follows a three-level hierarchy:

1. **Profile Presets** (User Profiles)
   - Define types of users with characteristic traits
   - Have 3 factors: Human Expertise, AI Capability, Governance & Safety
   - Examples: Enterprise Maintainer, AI-Native Product-Maker
   
2. **Scenarios** (Tasks within Profiles)
   - Specific tasks or contexts a user type might encounter
   - Each preset has its own set of scenarios
   - Have 3 different factors: Task Importance, Task Complexity, Codebase Maturity
   - Example: Enterprise Maintainer → Prototyping scenario
   
3. **Workflows** (Cell Sequences)
   - The actual path through the interaction matrix
   - Defined by the combination of preset + scenario
   - Visualized with numbered dots and curved connecting lines
   - Example: "enterprise-maintainer:prototyping" workflow

This hierarchy means:
- A scenario belongs to a specific preset (not global)
- A workflow is defined by the preset:scenario combination
- Deleting a preset deletes all its scenarios and workflows
- You must select a preset before scenarios appear

## Data Management Features

### Export/Import
- **Export**: Download all scenario data as a JSON file for backup or sharing
- **Import**: Load scenario data from a previously exported file
- **Auto-backup**: Automatic backup is created before importing data
- **Cross-device**: Share data files across browsers and devices

### Backup System
- **Create Backup**: Save a snapshot of current data with timestamp
- **Restore Backup**: Browse and restore from up to 5 recent backups
- **Automatic Cleanup**: Old backups are automatically removed (keeps last 5)

### Data Format
The JSON data file includes:
- Version and timestamp information
- Product capabilities and metadata
- Profile presets and their factors
- Scenario workflows and factors
- All display names and customizations

### Use Cases
- **Team Collaboration**: Share customized presets and scenarios with team members
- **Version Control**: Export data files and track them in version control
- **Environment Management**: Maintain different configurations for different contexts
- **Backup**: Create regular backups before making significant changes
- **Migration**: Move data between browsers or devices easily

## Future Enhancements

Potential areas for expansion:
- More preset and scenario templates
- Additional visualization options
- Comparison mode to overlay multiple workflows
- Analytics on workflow patterns
- Shareable URLs with encoded configurations
- Preset cloning to quickly create variations
- Bulk scenario operations
- Cloud-based synchronization
- Real-time collaboration features

## Credits

Developed as an interactive framework for understanding human-AI interaction patterns across different levels of autonomy and focus areas.

## License

This is a demonstration/research tool. Please adapt and modify as needed for your use case.
