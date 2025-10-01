# Data Storage and Persistence Guide

## Overview
This guide explains how to use the data storage features to persist and share your scenario customizations.

## Storage Methods

### 1. Automatic Storage (localStorage)
- **What it stores**: All changes made in the application
- **When it saves**: Automatically when you exit edit mode
- **Where it's stored**: Browser's localStorage (specific to your browser/device)
- **Persistence**: Data remains until browser cache is cleared
- **Limitation**: Cannot be shared across browsers or devices

### 2. File-Based Storage (JSON Export/Import)
- **What it stores**: Complete snapshot of all data
- **When it saves**: On-demand when you click "Export Data"
- **Where it's stored**: As a file on your computer
- **Persistence**: Permanent until you delete the file
- **Advantage**: Can be shared, backed up, and version controlled

## How to Use

### Exporting Data

1. Make your changes to presets, scenarios, or product capabilities
2. Click the **"Export Data"** button in the Data Management section
3. A file named `ux-table-data.json` will be downloaded to your Downloads folder
4. This file contains all your customizations

**When to Export:**
- After making significant changes
- Before sharing configurations with team members
- For backup purposes
- To transfer data to another browser/device

### Importing Data

1. Click the **"Import Data"** button
2. Select a `ux-table-data.json` file from your computer
3. The application will automatically:
   - Create a backup of current data
   - Load all data from the file
   - Update the UI to reflect the imported data

**Important Notes:**
- Import will **replace** current data with the file's contents
- A backup is automatically created before import
- You can restore the backup if needed

### Creating Backups

1. Click the **"Create Backup"** button
2. A timestamped backup is created in localStorage
3. Up to 5 most recent backups are kept automatically

**Best Practices:**
- Create backups before making major changes
- Create backups before importing data from a file
- Regular backups help prevent data loss

### Restoring Backups

1. Click the **"Restore Backup"** button
2. A dialog shows available backups with timestamps
3. Enter the number of the backup you want to restore
4. Confirm the restoration

**Available Backups:**
- Each backup includes a date and time
- Backups are listed newest first
- Only the last 5 backups are retained

## Data File Format

The exported JSON file has the following structure:

```json
{
  "version": "1.0",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "productCapabilities": { ... },
  "productMetadata": { ... },
  "presets": { ... },
  "presetFactors": { ... },
  "presetMetadata": { ... },
  "workflows": { ... },
  "scenarioFactors": { ... },
  "scenarioMetadata": { ... }
}
```

### Key Sections:

**productCapabilities**: Maps product IDs to arrays of [role, focus] pairs
- Example: `"github-copilot": [["Tool", "Code Focused"], ...]`

**productMetadata**: Display names for products
- Example: `"github-copilot": "GitHub Copilot Completions, NES"`

**presets**: Preset definitions (currently unused)
- Legacy structure maintained for compatibility

**presetFactors**: Factor values for each preset (0-100)
- Example: `"enterprise-maintainer": { "expertise": 75, ... }`

**presetMetadata**: Display names for presets
- Example: `"enterprise-maintainer": "Enterprise Maintainer"`

**workflows**: Scenario workflows keyed by "preset:scenario"
- Example: `"enterprise-maintainer:prototyping": [[role, focus], ...]`

**scenarioFactors**: Factor values for each scenario (0-100)
- Example: `"enterprise-maintainer:prototyping": { "importance": 50, ... }`

**scenarioMetadata**: Scenario display names organized by preset
- Example: `"enterprise-maintainer": { "prototyping": "Prototyping" }`

## Common Workflows

### Sharing Configurations with a Team

1. Customize presets, scenarios, and workflows as needed
2. Export data to a file
3. Share the file via email, Slack, or version control
4. Team members import the file to see your configuration

### Maintaining Multiple Configurations

1. Create different configurations for different contexts
2. Export each configuration with a descriptive filename
   - `ux-table-data-enterprise.json`
   - `ux-table-data-startup.json`
3. Import the appropriate file when needed

### Version Control Integration

1. Export data to `ux-table-data.json`
2. Commit the file to your Git repository
3. Track changes over time with Git history
4. Share configurations via pull requests

### Backup Strategy

**Before Major Changes:**
1. Click "Create Backup"
2. Make your changes
3. If something goes wrong, click "Restore Backup"

**Weekly Backups:**
1. Export data to a file
2. Save with a date: `ux-table-data-2025-10-01.json`
3. Store in a backup folder or cloud storage

## Troubleshooting

### Import Fails
- **Check file format**: Ensure it's a valid JSON file
- **Check file content**: Verify it was exported from this application
- **Try a backup**: Use "Restore Backup" instead

### Lost Data After Browser Clear
- **Prevention**: Export data regularly to files
- **Recovery**: Import from your most recent export file

### Changes Not Saving
- **Check localStorage**: Ensure browser allows localStorage
- **Exit edit mode**: Changes save when you click "Exit"
- **Export as backup**: Save to a file as additional backup

### File Too Large
- **Normal size**: Usually 5-50 KB depending on customizations
- **If very large**: May indicate corruption; try creating a fresh export

## Best Practices

1. **Regular Exports**: Export data after significant changes
2. **Descriptive Naming**: Use clear filenames like `ux-table-enterprise-Q4.json`
3. **Version Control**: Track data files in Git for change history
4. **Team Sharing**: Use a shared folder or repository for team configurations
5. **Before Imports**: Always create a backup first
6. **Test Imports**: Import on a test browser first if uncertain
7. **Document Changes**: Add comments in commit messages or file notes

## Technical Details

### Storage Limits
- **localStorage**: ~5-10 MB per domain (browser dependent)
- **JSON files**: No practical limit for this application
- **Backups**: 5 most recent backups kept in localStorage

### Data Validation
- Import validates JSON structure
- Checks for expected properties
- Handles missing or partial data gracefully

### Auto-Save Behavior
- Triggers after changes in edit mode
- Hooks into existing save functions
- Maintains localStorage consistency
- Can be extended for additional features

### Browser Compatibility
- Works in all modern browsers
- Requires localStorage support
- File downloads use standard Blob API
- File uploads use standard FileReader API
