# System Architecture Diagram

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Profile    │  │  Scenarios   │  │  Product Capabilities  │ │
│  │  Presets    │  │              │  │                        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Data Management Section (NEW)                    │ │
│  │  [Export] [Import] [Create Backup] [Restore Backup]       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Storage Layer (NEW)                       │
│                      data-storage.js                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Export     │  │   Import     │  │   Backup System      │ │
│  │  Functions   │  │  Functions   │  │   (5 snapshots)      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────┐         ┌─────────────────────┐
│   localStorage       │         │   File System       │
│   (Browser)          │         │   (User's Computer) │
│                      │         │                     │
│ • Product Data       │         │ ux-table-data.json  │
│ • Presets            │         │                     │
│ • Scenarios          │         │ • All Data          │
│ • Workflows          │         │ • Versioned         │
│ • Factors            │         │ • Timestamped       │
│ • Backups (5)        │         │ • Shareable         │
└──────────────────────┘         └─────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
                    ┌───────────────┐
                    │ Application   │
                    │   Restart     │
                    └───────────────┘
                            │
                            ▼
                    Data Reloaded ✓
```

## Component Interaction

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│   index.html │────────▶│ data-storage │────────▶│  localStorage│
│              │         │      .js     │         │              │
│   • UI       │◀────────│              │◀────────│  • Automatic │
│   • Events   │         │ • Export     │         │  • Fast      │
│   • Display  │         │ • Import     │         │  • Local     │
│              │         │ • Backup     │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │
      │                         │
      ▼                         ▼
┌──────────────┐         ┌──────────────┐
│              │         │              │
│  JSON Files  │         │    Backups   │
│              │         │              │
│ • Export     │         │ • Timestamp  │
│ • Download   │         │ • Keep 5     │
│ • Share      │         │ • Restore    │
│              │         │              │
└──────────────┘         └──────────────┘
```

## User Workflow

```
                        START
                          │
                          ▼
                 ┌────────────────┐
                 │ Open index.html│
                 └────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Load from localStorage       │
          │  (if exists)                  │
          └───────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Display Current Data         │
          │  • Presets                    │
          │  • Scenarios                  │
          │  • Workflows                  │
          │  • Products                   │
          └───────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
  ┌──────────────────┐        ┌──────────────────┐
  │  Make Changes    │        │  Load from File  │
  │  • Edit Presets  │        │  • Import Data   │
  │  • Edit Scenarios│        │  • Restore Backup│
  │  • Adjust Factors│        └──────────────────┘
  └──────────────────┘                  │
            │                           │
            ▼                           │
  ┌──────────────────┐                  │
  │  Exit Edit Mode  │                  │
  │  • Auto-save to  │                  │
  │    localStorage  │                  │
  └──────────────────┘                  │
            │                           │
            └─────────────┬─────────────┘
                          ▼
            ┌─────────────────────────┐
            │  Optional: Export to    │
            │  File for Backup/Share  │
            └─────────────────────────┘
                          │
                          ▼
                        END
```

## Export Flow Detail

```
User Clicks "Export Data"
         │
         ▼
┌─────────────────────┐
│ Collect All Data    │
│ • Products          │
│ • Presets           │
│ • Scenarios         │
│ • Workflows         │
│ • Factors           │
│ • Metadata          │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Create JSON Object  │
│ • Add version       │
│ • Add timestamp     │
│ • Structure data    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Convert to String   │
│ • JSON.stringify()  │
│ • Pretty format     │
│ • 2-space indent    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Create Blob         │
│ • type: app/json    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Create Download Link│
│ • Generate URL      │
│ • Set filename      │
│ • Auto-click        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ File Downloads      │
│ ux-table-data.json  │
└─────────────────────┘
         │
         ▼
   Show Success ✓
```

## Import Flow Detail

```
User Clicks "Import Data"
         │
         ▼
┌─────────────────────┐
│ File Dialog Opens   │
│ User selects .json  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Create Auto-Backup  │
│ (safety measure)    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Read File           │
│ • FileReader API    │
│ • Parse JSON        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Validate Structure  │
│ • Check format      │
│ • Verify properties │
└─────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Valid?    Invalid
    │         │
    │         ▼
    │    Show Error ❌
    │         │
    │         ▼
    │      STOP
    │
    ▼
┌─────────────────────┐
│ Merge Data          │
│ • Products          │
│ • Presets           │
│ • Scenarios         │
│ • Workflows         │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Save to localStorage│
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Reinitialize UI     │
│ • Update buttons    │
│ • Update dropdowns  │
│ • Update sliders    │
└─────────────────────┘
         │
         ▼
   Show Success ✓
```

## Data Structure

```
ux-table-data.json
│
├── version: "1.0"
├── timestamp: "2025-10-01T..."
│
├── productCapabilities: {}
│   ├── "github-copilot": [["Tool", "Code"], ...]
│   ├── "spec-kit": [...]
│   └── ...
│
├── productMetadata: {}
│   ├── "github-copilot": "GitHub Copilot..."
│   └── ...
│
├── presets: {}
│   ├── "enterprise-maintainer": []
│   └── ...
│
├── presetFactors: {}
│   ├── "enterprise-maintainer": {
│   │       expertise: 75,
│   │       aicapability: 60,
│   │       governance: 85
│   │   }
│   └── ...
│
├── presetMetadata: {}
│   ├── "enterprise-maintainer": "Enterprise Maintainer"
│   └── ...
│
├── workflows: {}
│   ├── "enterprise-maintainer:prototyping": [...]
│   └── ...
│
├── scenarioFactors: {}
│   ├── "enterprise-maintainer:prototyping": {
│   │       importance: 50,
│   │       complexity: 50,
│   │       maturity: 50
│   │   }
│   └── ...
│
└── scenarioMetadata: {}
    ├── "enterprise-maintainer": {
    │       "prototyping": "Prototyping"
    │   }
    └── ...
```

## Storage Comparison

```
┌────────────────────┬──────────────────┬─────────────────┐
│      Feature       │   localStorage   │   JSON File     │
├────────────────────┼──────────────────┼─────────────────┤
│ Automatic Save     │        ✓         │       ✗         │
│ Persists on Close  │        ✓         │       ✓         │
│ Cross-Browser      │        ✗         │       ✓         │
│ Shareable          │        ✗         │       ✓         │
│ Version Control    │        ✗         │       ✓         │
│ Offline Access     │        ✓         │       ✓         │
│ Size Limit         │     5-10 MB      │   Unlimited     │
│ Speed              │      Fast        │     Medium      │
│ Manual Action      │     Not Req.     │    Required     │
│ Team Collaboration │        ✗         │       ✓         │
└────────────────────┴──────────────────┴─────────────────┘
```

## Backup System

```
localStorage
    │
    ├── uxTableProductCapabilities
    ├── uxTableProductMetadata
    ├── uxTablePresets
    ├── uxTablePresetFactors
    ├── uxTablePresetMetadata
    ├── uxTableWorkflows
    ├── uxTableScenarioFactors
    ├── uxTableScenarioMetadata
    │
    └── Backups (up to 5)
        ├── uxTableBackup_1727798400000 (newest)
        ├── uxTableBackup_1727712000000
        ├── uxTableBackup_1727625600000
        ├── uxTableBackup_1727539200000
        └── uxTableBackup_1727452800000 (oldest)
            │
            └── [Older backups auto-deleted]
```

## Integration Points

```
Original Functions          Enhanced Functions
─────────────────          ──────────────────
saveProductCapabilities()  ─┐
                            ├──► Auto-save Hook
savePresets()              ─┤     │
                            │     ▼
saveWorkflows()            ─┘  DataStorage.autoSave()
                                    │
                                    ▼
                            [Optional: Export to File]
```

## Error Handling

```
User Action
    │
    ▼
Try Operation
    │
    ├──► Success ──► Show Success Message ──► Continue
    │
    └──► Error
         │
         ├──► Catch Exception
         │         │
         │         ▼
         │    Log to Console
         │         │
         │         ▼
         │    Show Error Message
         │         │
         │         ▼
         └────► Rollback (if needed)
                    │
                    ▼
                   STOP
```

---

This architecture ensures:
- ✓ Data persistence across sessions
- ✓ Easy backup and recovery
- ✓ Team collaboration capability
- ✓ Graceful error handling
- ✓ User-friendly operation
