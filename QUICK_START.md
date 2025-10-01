# Quick Start: Using Data Persistence

## First Time Setup

1. **Open the Application**
   - Open `index.html` in your web browser
   - The application loads with default presets and scenarios

2. **Make Your Customizations**
   - Select a Profile Preset (e.g., "Enterprise Maintainer")
   - Select a Scenario (e.g., "Prototyping")
   - Click "Edit" to modify scenarios or create new ones
   - Adjust factor sliders to set values
   - Click cells to define workflow paths
   - Click "Exit" to save changes

3. **Export Your Data** (Recommended!)
   - Click **"Export Data"** in the Data Management section
   - Save the downloaded file: `ux-table-data.json`
   - Store it safely - this is your backup!

## Daily Usage

### Making Changes
1. Edit presets, scenarios, or workflows as needed
2. Changes are automatically saved to browser localStorage
3. Periodically click "Export Data" to create file backups

### Sharing with Team
1. Click "Export Data"
2. Share the `ux-table-data.json` file with colleagues
3. They click "Import Data" and select your file
4. Everyone sees the same configuration!

### Switching Configurations
1. Export current data first (backup)
2. Click "Import Data"
3. Select the configuration file you want to load
4. Application updates immediately

## Common Tasks

### Save a Backup Before Major Changes
```
1. Click "Create Backup"
2. See "Backup created successfully!" message
3. Make your changes
4. If needed, click "Restore Backup" to undo
```

### Recover from Mistakes
```
1. Click "Restore Backup"
2. Select the backup from the list (numbered 1, 2, 3...)
3. Confirm restoration
4. Your previous state is restored
```

### Transfer to Another Browser
```
1. In old browser: Click "Export Data"
2. Transfer the file to new device/browser
3. In new browser: Open application
4. Click "Import Data" and select the file
5. All your data is now in the new browser!
```

## Tips & Tricks

### 💡 Regular Backups
Export data after significant changes. Store files with descriptive names:
- `ux-table-data-2025-10-01.json`
- `ux-table-enterprise-config.json`

### 💡 Version Control
If you use Git, commit the data file:
```bash
git add ux-table-data.json
git commit -m "Updated enterprise maintainer workflow"
```

### 💡 Before Experimenting
Always create a backup before trying new workflows:
1. Click "Create Backup"
2. Experiment freely
3. Restore if needed

### 💡 Team Standardization
Keep a "golden" configuration file:
1. Create your ideal setup
2. Export and name it: `team-standard.json`
3. Share with all team members
4. Everyone imports the same file

## Troubleshooting

### "Import failed" Error
- Ensure you selected a `.json` file
- Verify the file was exported from this application
- Try restoring from a backup instead

### Changes Not Showing After Refresh
- Did you click "Exit" in edit mode? (Required to save)
- Check if browser allows localStorage
- Try exporting and re-importing

### Lost Data After Clearing Browser
- Browser localStorage was cleared
- Solution: Import from your most recent export file
- Prevention: Export regularly!

## Data File Location

After export, find your file in:
- **Windows**: `C:\Users\YourName\Downloads\ux-table-data.json`
- **Mac**: `/Users/YourName/Downloads/ux-table-data.json`
- **Linux**: `/home/yourname/Downloads/ux-table-data.json`

## Status Messages

Watch for these messages after actions:

✅ **"Data exported successfully!"**
- File downloaded, check your Downloads folder

✅ **"Data imported successfully!"**
- All data loaded from file

✅ **"Backup created successfully!"**
- Snapshot saved in localStorage

✅ **"Backup restored successfully!"**
- Previous state recovered

❌ **"Failed to import data: [error]"**
- Check file format and try again

❌ **"No backups available"**
- No backups exist yet, create one first

## What Gets Saved?

Everything you customize:
- ✅ All profile presets and their names
- ✅ All scenarios and their names
- ✅ Workflow paths (cell sequences)
- ✅ All factor values (sliders)
- ✅ Product capability mappings
- ✅ Product names

What doesn't get saved:
- ❌ UI state (which panel is open/closed)
- ❌ Current selections (active buttons)
- ❌ The table content itself (static data)

## Need More Help?

See detailed documentation:
- `README.md` - Full application guide
- `DATA_STORAGE_GUIDE.md` - Complete storage reference
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## Quick Reference Card

| Action | Button | Result |
|--------|--------|--------|
| Save to file | Export Data | Downloads JSON file |
| Load from file | Import Data | Replaces all data |
| Quick snapshot | Create Backup | Saves to localStorage |
| Undo changes | Restore Backup | Recovers previous state |
| Share config | Export → Send file | Team gets same setup |

---

**Remember**: Export regularly, backup before experiments, and share with your team!
