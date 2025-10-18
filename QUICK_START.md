# Quick Start Guide

## Introduction

The **Interactive UX Roles Table** is a comprehensive visualization tool for exploring different UX interaction patterns between humans and AI systems across varying levels of autonomy and focus areas. This application provides a framework for understanding how users interact with AI tools across different contexts.

### Two Ways to Use This Application

1. **Quick Use** - Use the deployed web application (no setup required)
2. **Developer Setup** - Run the full application locally with database backend

---

## Using the Application

### Main Features

The application provides several key features for exploring UX interaction patterns:

1. **Interactive UX Roles Table** (5x3 matrix)
   - 5 rows: Tool, Advisor, Co-Creator, Team-Mate, Delegate (increasing autonomy)
   - 3 columns: Code Focused, Intent Focused, Orchestration Focused
   - Hover over cells to see detailed interaction patterns

2. **Profile Presets**
   - Predefined user profiles (Enterprise Maintainer, AI-Native Product-Maker, etc.)
   - Each profile has three factors: Human Expertise, AI Capability, Governance & Safety
   - Click to select and see characteristics

3. **Scenarios with Workflow Visualization**
   - Specific tasks within each profile (e.g., Prototyping)
   - Visualized with numbered purple dots and curved connecting lines
   - Each scenario has contextual factors: Task Importance, Complexity, Codebase Maturity

4. **Product Capabilities**
   - Highlight which interaction patterns different AI products support
   - Compare tools like GitHub Copilot, Cursor IDE, Claude, etc.

5. **Data Management**
   - Export configurations to JSON files
   - Import previously saved configurations
   - Create and restore backups
   - Share configurations with team members

For detailed feature documentation, see [README.md](README.md).

---

## Quick Use (Deployed Application)

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection

### Getting Started
1. **Access the Application**: Open the deployed Azure Static Web App in your browser
2. **Explore the Interface**: The application loads immediately with sample data
3. **Learn the Features**: See the detailed [README.md](README.md) for comprehensive feature documentation

### Basic Navigation
- **Hover over cells** in the 5x3 matrix to see interaction pattern details
- **Click Profile Preset buttons** to see user characteristics and select scenarios
- **Click Scenario buttons** to visualize workflows with numbered steps and connecting lines
- **Click Product buttons** to see which interaction patterns different tools support
- **Use the Data Management section** to export/import your configurations

---

## Developer Setup (Full Local Environment)

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL Database** (local installation or Azure MySQL)
- **Azure Functions Core Tools** - [Installation guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- **Git** - [Download here](https://git-scm.com/)

### Database Setup

#### Option 1: Local MySQL Installation

1. **Install MySQL**:
   ```bash
   # Windows (using Chocolatey)
   choco install mysql

   # macOS (using Homebrew)
   brew install mysql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   ```

2. **Start MySQL Service**:
   ```bash
   # Windows
   net start mysql

   # macOS
   brew services start mysql

   # Ubuntu/Debian
   sudo systemctl start mysql
   ```

3. **Create Database**:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE customermodel;
   USE customermodel;
   ```

4. **Set Up Schema**: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for the complete schema

#### Option 2: Azure MySQL (Recommended for Production)

1. **Create Azure MySQL Database**:
   - Go to Azure Portal
   - Create a new MySQL Flexible Server
   - Note the connection details

2. **Configure Firewall**:
   - Add your IP address to the firewall rules
   - Enable "Allow access to Azure services"

### Backend Setup (Azure Functions API)

1. **Navigate to API Directory**:
   ```bash
   cd api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database Connection**:
   
   Edit `api/local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "NODE_ENV": "development",
       "DB_HOST": "your-mysql-host",
       "DB_PORT": "3306",
       "DB_USER": "your-username",
       "DB_PASS": "your-password",
       "DB_NAME": "customermodel",
       "DB_SSL": "true",
       "DB_SSL_CA": ""
     },
     "Host": {
       "CORS": "*",
       "CORSCredentials": false
     }
   }
   ```

4. **Start Azure Functions**:
   ```bash
   # Option 1: Using npm script
   npm start

   # Option 2: Using Azure Functions Core Tools directly
   func start
   ```

5. **Verify API is Running**:
   - Open `http://localhost:7071/api/profiles` in your browser
   - You should see JSON data or an empty array `[]`

### Frontend Setup

1. **Open the Application**:
   - Navigate to the project root directory
   - Open `index.html` in your web browser
   - The frontend automatically detects localhost and connects to `http://localhost:7071/api`

2. **No Build Process Required**:
   - This is a vanilla JavaScript application
   - All files are loaded directly by the browser
   - Changes to `index.html` are reflected immediately on refresh

### Key Files Overview

- **`api/local.settings.json`** - Database and Azure Functions configuration
- **`api/shared/db.js`** - Database connection module with MySQL pool
- **`api/src/app.js`** - Azure Functions registration and routing
- **`api-client.js`** - Frontend API client (auto-detects local vs. production)
- **`data-transform.js`** - Data transformation between database and frontend formats
- **`index.html`** - Main application file with UI and core functionality

---

## Development Workflow

### Making Frontend Changes

1. **Edit the UI**: Modify `index.html` directly
2. **Test Changes**: Refresh the browser to see changes
3. **Debug**: Use browser developer tools (F12) for debugging

### Making API Changes

1. **Edit Handlers**: Modify files in `api/src/handlers/`
2. **Restart Functions**: Stop and restart the Azure Functions (`Ctrl+C` then `npm start`)
3. **Test API**: Use browser developer tools or tools like Postman to test endpoints

### Data Persistence

The application uses dual persistence:

- **localStorage**: For frontend-only mode (works without backend)
- **MySQL Database**: For full-stack mode (when backend is running)

Data is automatically synchronized between the frontend and database when the API is available.

---

## Troubleshooting

### Common Issues

#### API Connection Errors

**Problem**: Frontend shows "API Error" or can't load data
**Solutions**:
- Verify Azure Functions is running on `http://localhost:7071`
- Check browser console for CORS errors
- Ensure `api/local.settings.json` has correct database credentials
- Try accessing `http://localhost:7071/api/profiles` directly

#### Database Connection Issues

**Problem**: Azure Functions fails to start with database errors
**Solutions**:
- Verify MySQL is running and accessible
- Check database credentials in `api/local.settings.json`
- Ensure database `customermodel` exists
- Test connection with MySQL client: `mysql -h your-host -u your-user -p`

#### Azure Functions Not Starting

**Problem**: `npm start` fails or functions don't load
**Solutions**:
- Ensure Azure Functions Core Tools is installed: `func --version`
- Check Node.js version (requires v18+): `node --version`
- Verify all dependencies are installed: `npm install`
- Check for port conflicts (7071 should be available)

#### Browser Compatibility

**Problem**: Application doesn't work in certain browsers
**Solutions**:
- Use modern browsers (Chrome, Firefox, Edge, Safari latest versions)
- Enable JavaScript
- Check browser console for errors
- Clear browser cache and localStorage

### Getting Help

1. **Check Logs**: Look at browser console (F12) and Azure Functions terminal output
2. **Verify Configuration**: Ensure all settings in `api/local.settings.json` are correct
3. **Test Components**: Verify database, API, and frontend separately
4. **Review Documentation**: Check [README.md](README.md) and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## Next Steps

### For End Users
- Explore the [README.md](README.md) for detailed feature documentation
- Try creating custom profiles and scenarios
- Export your configurations for backup

### For Developers
- Review [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database structure
- Check [CHANGELOG.md](CHANGELOG.md) for version history and recent changes
- Examine the API handlers in `api/src/handlers/` to understand the backend
- Look at `data-transform.js` to understand data flow between database and frontend

### Additional Resources
- **API Endpoints**: `/api/profiles`, `/api/scenarios`, `/api/products`, `/api/workflow-steps`, `/api/vocabularies`
- **Configuration**: Database settings, CORS configuration, SSL settings
- **Data Format**: JSON structure for profiles, scenarios, workflows, and products

---

**Ready to get started?** Choose your path above and begin exploring the Interactive UX Roles Table!
