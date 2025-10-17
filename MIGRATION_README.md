# Customer Model - Azure Static Web App Migration

## Overview
This application has been restructured to use Azure Functions with MySQL database instead of local JSON file storage.

## Architecture

### Frontend
- **index.html** - Main application UI
- **api-client.js** - JavaScript client for API calls

### Backend (Azure Functions)
- **/api** folder contains all Azure Functions
  - **profiles** - CRUD operations for profiles (formerly presets)
  - **scenarios** - CRUD operations for scenarios
  - **workflow-steps** - CRUD operations for workflow steps
  - **products** - CRUD operations for products and their capabilities
  - **vocabularies** - Read-only access to dev_approaches and partner_approaches
  - **shared/db.js** - Database connection pooling

## Database Schema
See `DATABASE_SCHEMA.md` for complete schema documentation.

### Key Tables
- **profiles** - User profiles (expertise, aicapability, governance factors)
- **scenarios** - Scenarios tied to profiles (importance, complexity, maturity factors)
- **workflow_steps** - Ordered workflow steps for each scenario
- **products** - Product definitions
- **product_capabilities** - Product capabilities (role × focus combinations)
- **dev_approaches** - Development approaches vocabulary (Tool, Advisor, etc.)
- **partner_approaches** - Partner approaches vocabulary (Code, Intent, etc.)

## Setup Instructions

### 1. Install Azure Functions Core Tools
```powershell
npm install -g azure-functions-core-tools@4
```

### 2. Install API Dependencies
```powershell
cd api
npm install
```

### 3. Configure Local Settings
Update `api/local.settings.json` with your MySQL connection details:
```json
{
  "Values": {
    "DB_HOST": "your-mysql-server.mysql.database.azure.com",
    "DB_PORT": "3306",
    "DB_USER": "your-username",
    "DB_PASS": "your-password",
    "DB_NAME": "customermodel",
    "DB_SSL": "true"
  }
}
```

### 4. Run Locally
```powershell
# Terminal 1: Start Azure Functions
cd api
func start

# Terminal 2: Serve the frontend
# Use any local web server, e.g.:
npx http-server -p 8080
```

The API will run on `http://localhost:7071/api`
The frontend will run on `http://localhost:8080`

## API Endpoints

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/{profile_key}` - Get specific profile
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/{profile_key}` - Update profile
- `DELETE /api/profiles/{profile_key}` - Delete profile

### Scenarios
- `GET /api/scenarios` - Get all scenarios
- `GET /api/scenarios/{profile_key}` - Get scenarios for a profile
- `GET /api/scenarios/{profile_key}/{scenario_key}` - Get specific scenario
- `POST /api/scenarios/{profile_key}` - Create scenario
- `PUT /api/scenarios/{profile_key}/{scenario_key}` - Update scenario
- `DELETE /api/scenarios/{profile_key}/{scenario_key}` - Delete scenario

### Workflow Steps
- `GET /api/workflow-steps/{profile_key}/{scenario_key}` - Get workflow steps
- `POST /api/workflow-steps/{profile_key}/{scenario_key}` - Save workflow steps (replaces all)
- `DELETE /api/workflow-steps/{profile_key}/{scenario_key}` - Delete all workflow steps

### Products
- `GET /api/products` - Get all products with capabilities
- `GET /api/products/{product_key}` - Get specific product
- `POST /api/products` - Create product
- `PUT /api/products/{product_key}` - Update product
- `DELETE /api/products/{product_key}` - Delete product

### Vocabularies
- `GET /api/vocabularies` - Get all vocabularies
- `GET /api/vocabularies/dev-approaches` - Get dev approaches
- `GET /api/vocabularies/partner-approaches` - Get partner approaches

## Deployment to Azure

### Prerequisites
- Azure Static Web Apps resource created
- GitHub repository connected to Azure Static Web Apps
- MySQL database on Azure

### Build Configuration
Azure Static Web Apps will automatically detect and deploy:
- Frontend files (index.html, api-client.js, etc.)
- API functions (from `/api` folder)

### Environment Variables
Configure in Azure Portal → Static Web Apps → Configuration:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_SSL`
- `DB_SSL_CA` (if using custom CA)

## Migration Status

### ✅ Completed
- Removed JSON export/import/backup functionality
- Removed data-storage.js
- Created Azure Functions API structure
- Created database connection module
- Created API endpoints for all data operations
- Created API client for frontend
- Updated .gitignore for Azure Functions
- Created staticwebapp.config.json

### ⚠️ Remaining Work
The frontend (`index.html`) still needs updates to:

1. **Replace localStorage calls with API calls**
   - Update `savePresets()` to call `API.updateProfile()`
   - Update `saveWorkflows()` to call `API.saveWorkflowSteps()`
   - Update `saveProductCapabilities()` to call `API.updateProduct()`
   - Remove `loadPresets()`, `loadWorkflows()`, `loadProductCapabilities()`

2. **Transform database data structure**
   - Database uses normalized structure (separate tables)
   - Frontend uses flat objects with composite keys
   - Need transformation layer in `DOMContentLoaded` handler

3. **Update edit mode save operations**
   - When user exits edit mode, save to database
   - Add loading indicators during save operations
   - Add error handling and user feedback

4. **Initialize data from database**
   - Load all data on page load
   - Populate the existing data structures
   - Call existing initialization functions

## Data Structure Mapping

### Frontend → Database

**Profiles (Presets)**
```javascript
// Frontend
presetFactors["enterprise-maintainer"] = { expertise: 75, aicapability: 60, governance: 85 }

// Database
profiles table:
{
  profile_key: "enterprise-maintainer",
  display_name: "Enterprise Maintainer",
  expertise: 75,
  aicapability: 60,
  governance: 85
}
```

**Scenarios**
```javascript
// Frontend
scenarioFactors["enterprise-maintainer:prototyping"] = { importance: 50, complexity: 50, maturity: 50 }

// Database
scenarios table:
{
  profile_id: <profile FK>,
  scenario_key: "prototyping",
  display_name: "Prototyping",
  importance: 50,
  complexity: 50,
  maturity: 50
}
```

**Workflows**
```javascript
// Frontend
workflows["enterprise-maintainer:prototyping"] = [["Tool", "Code Focused"], ["Advisor", "Intent Focused"]]

// Database
workflow_steps table:
[
  { scenario_id: <FK>, step_index: 1, dev_approach_id: <Tool FK>, partner_approach_id: <Code FK> },
  { scenario_id: <FK>, step_index: 2, dev_approach_id: <Advisor FK>, partner_approach_id: <Intent FK> }
]
```

## Next Steps

1. Implement data transformation functions to convert between frontend and database structures
2. Update all save operations to use API calls
3. Remove localStorage dependencies
4. Test CRUD operations for all entities
5. Add loading states and error handling
6. Deploy to Azure Static Web Apps

## Files Removed
- `data-storage.js` - Replaced by api-client.js
- `server.js` - Replaced by Azure Functions
- `app.js` - No longer needed
- `ux-table-data.json` - Data now in MySQL
- `DATA_STORAGE_GUIDE.md` - Outdated documentation
- `ARCHITECTURE.md` - Outdated architecture

## Files Added
- `api/` - Azure Functions folder structure
- `api-client.js` - Frontend API client
- `staticwebapp.config.json` - Azure Static Web Apps configuration
- `MIGRATION_README.md` - This file
