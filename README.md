# Interactive UX Roles Table

An interactive visualization tool for exploring different UX interaction patterns between humans and AI systems across varying levels of autonomy and focus areas.

## Overview

This application provides a comprehensive framework for understanding how users interact with AI tools across different contexts. It visualizes:

1. **UX Interaction Modes** - A 5x3 matrix showing different roles (Tool, Advisor, Co-Creator, Team-Mate, Delegate) across three focus areas (Code, Intent, Orchestration)
2. **Product Capabilities** - Highlights which interaction modes different AI products support
3. **User Scenarios & Workflows** - Visualizes how users move between different interaction modes during specific tasks
4. **Situational Factors** - Shows the contextual factors that influence workflow patterns

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

### 2. Product Capability Visualization

**Purpose**: Highlight which cells represent interaction patterns supported by specific AI products.

**How to Use**:
1. Click any product button (GitHub Copilot, spec-kit, Cursor IDE, Claude, or GitHub Copilot Agent Mode)
2. Relevant cells are highlighted in blue
3. Click "Clear All" to remove highlights

**Edit Mode**:
1. Click "Enter Edit Mode"
2. Select a product from the dropdown
3. Click cells to toggle their selection (yellow highlighting)
4. Click "Save" to persist changes or "Cancel" to discard
5. The existing mappings for the selected product are pre-loaded for easy modification

**Persistence**: Product mappings are saved to browser localStorage and persist across page refreshes.

**Reset**: Click "Reset to Defaults" to restore original product mappings.

### 3. User Scenarios & Workflows

**Purpose**: Visualize how users move between different interaction modes during specific tasks.

**How to Use**:
1. Click a scenario button to see the workflow:
   - **Developer: Prototype** - Fast experimentation workflow
   - **Developer: Production** - Professional, careful workflow
   - **Developer: Learning** - Educational, exploration-focused workflow
   - **Custom Scenario 1** - Your own custom workflow
2. The visualization shows:
   - **Numbered dots** on cells (1, 2, 3...) indicating sequence
   - **Curved connecting lines** showing the path between steps
   - **Purple highlighting** on selected cells
3. Click "Clear Scenario" to remove the visualization

**Workflow Visualization**:
- Lines curve to avoid passing through intermediate cells
- The order of cells matters - it represents the temporal sequence
- Numbers on dots show the exact order of the workflow

**Edit Scenario Mode**:
1. Click "Edit Scenario"
2. Select a scenario from the dropdown
3. Click cells **in order** to build the workflow path
   - Each click adds the cell to the sequence
   - Click an existing dot to remove it and all subsequent steps
4. Watch the real-time preview with numbered dots and connecting lines
5. Click "Save" to persist or "Cancel" to discard
6. Existing workflow is pre-loaded for easy modification

**Persistence**: Scenarios are saved to browser localStorage.

**Reset**: Click "Reset Scenarios" to restore default workflows.

### 4. Situational Factors Equalizer

**Purpose**: Display the contextual factors that influence why users choose different interaction patterns.

**Factors Visualized** (0-100 scale):
- **Task Importance** - How critical is the task?
- **Task Complexity** - How complex is the work?
- **Human Expertise** - Developer's skill/confidence level
- **AI Capability** - How capable/reliable is the AI?
- **Codebase Maturity** - How established is the codebase?
- **Governance & Safety** - Compliance and safety requirements

**How It Works**:
- Bars start empty when no scenario is selected
- When you select a scenario, bars animate to show relevant factor levels
- Higher bars = more of that factor
- Values display below each bar
- Factors are read-only and automatically set by scenario selection

**Example - Developer: Prototype**:
- Low importance (30) - experimental work
- Lower complexity (40) - proving concept
- Moderate expertise (60) - exploring
- High AI capability (70) - leveraging tools
- Low maturity (20) - new codebase
- Low governance (20) - move fast

**Example - Developer: Production**:
- High importance (85) - production code
- Higher complexity (70) - real features
- Higher expertise (75) - professional work
- Good AI capability (65) - reliable assistant
- High maturity (80) - established codebase
- High governance (80) - safety critical

## Data Persistence

The application uses browser localStorage to persist:

1. **Product Capability Mappings** - Which cells each product lights up
2. **Scenario Workflows** - The sequence of cells for each scenario

**Storage Key**: 
- `uxTableProductCapabilities` - Product mappings
- `uxTableScenarios` - Scenario workflows

**Important Notes**:
- Data persists per browser/device
- Clearing browser data will reset to defaults
- Changes are saved automatically when you click "Save" in edit mode
- No server-side storage - all data is local

## Customization

### Adding New Products

1. Click "Enter Edit Mode" in the Product Capabilities section
2. Select an existing product or modify the dropdown in the code to add new ones
3. Click cells to define the product's capability matrix
4. Click "Save" to persist

### Creating Custom Scenarios

1. Click "Edit Scenario" in the User Scenarios section
2. Select "Custom Scenario 1" (or add more in the code)
3. Click cells in the order users would traverse them
4. Click "Save" to persist

### Modifying Situational Factors

Edit the `scenarioFactors` object in the JavaScript code:

```javascript
const scenarioFactors = {
  'scenario-key': {
    importance: 50,    // 0-100
    complexity: 50,    // 0-100
    expertise: 50,     // 0-100
    aicapability: 50,  // 0-100
    maturity: 50,      // 0-100
    governance: 50     // 0-100
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
2. **Understanding Products** - Click product buttons to see which patterns they support
3. **Seeing Workflows** - Click scenario buttons to visualize how users move between patterns
4. **Understanding Context** - Watch the situational factors to understand why workflows differ
5. **Customizing** - Use edit modes to create your own product mappings and scenarios

## File Structure

```
model.html          - Main application file (self-contained)
README.md           - This documentation file
```

## Getting Started

1. Open `model.html` in a modern web browser
2. Hover over cells in the table to explore interaction patterns
3. Click a product button to see which patterns it supports
4. Click a scenario button to see a workflow visualization
5. Use edit modes to customize products and scenarios

## Future Enhancements

Potential areas for expansion:
- Export/import functionality for scenarios and products
- More scenario templates
- Additional visualization options
- Comparison mode to overlay multiple scenarios
- Analytics on workflow patterns
- Shareable URLs with encoded configurations

## Credits

Developed as an interactive framework for understanding human-AI interaction patterns across different levels of autonomy and focus areas.

## License

This is a demonstration/research tool. Please adapt and modify as needed for your use case.
