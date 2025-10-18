# Azure App Service Migration Summary

## Changes Made for Azure App Service Deployment

This document summarizes the changes made to migrate the application from Azure Static Web App to Azure App Service.

### ✅ Files Created/Modified

#### 1. **`server.js`** (Created)
- Express server that serves both frontend and API
- Automatically loads and mounts API functions from `/api/src/functions/`
- Serves static files (index.html, CSS, JS, etc.)
- SPA fallback: unmatched routes redirect to index.html
- CORS enabled for API requests

#### 2. **`web.config`** (Created)
- IIS configuration for Node.js on App Service
- Configures iisnode to proxy requests to Express server
- Enables compression and caching
- Handles SPA routing

#### 3. **`.deployment`** (Created)
- Tells App Service which build command to run
- Runs `npm run build` before starting the application

#### 4. **`package.json`** (Modified)
- Changed `"main"` from `"data-storage.js"` to `"server.js"`
- Added `"start"` script: `node server.js`
- Updated `"build"` script: `npm --prefix ./api install`
- Updated `"test"` script to return exit code 0 (success)

#### 5. **`APP_SERVICE_DEPLOYMENT.md`** (Created)
- Complete deployment configuration guide
- Environment variables setup
- Troubleshooting common issues
- Production checklist

### 📋 How It Works

```
Client Request
    ↓
GitHub Actions Deploy
    ↓
App Service receives files
    ↓
npm run build (installs API dependencies)
    ↓
npm start (starts Express server)
    ↓
Express serves static files OR routes to API
```

### 🚀 Deployment Steps

1. **Commit and push** to your repository
2. **GitHub Actions** automatically triggers (based on your workflow)
3. **Build phase**: Runs `npm run build` (installs dependencies)
4. **Deployment**: OneDeploy packages and deploys to App Service
5. **Start phase**: App Service runs `npm start`
6. **Express server** starts and is ready to serve requests

### 🔧 What's Running

| Component | Location | Purpose |
|-----------|----------|---------|
| Express Server | `server.js` | Main application, routing |
| Static Files | Root directory | Frontend (HTML, CSS, JS) |
| API Functions | `api/src/functions/` | Backend business logic |
| Database | MySQL (Azure or external) | Data storage |
| Config | `web.config` | IIS/App Service settings |

### ⚙️ Environment Configuration

Set these in **Azure App Service → Configuration → Application Settings**:

**Required:**
```
PORT: (auto-set by App Service, default 3000)
NODE_ENV: production
```

**Database (Option A - Direct):**
```
DB_HOST: your-database-host
DB_PORT: 3306
DB_USER: your-username
DB_PASS: your-password
DB_NAME: customermodel
DB_SSL: true
```

**Database (Option B - Key Vault):**
```
KEY_VAULT_URL: https://your-keyvault.vault.azure.net/
```

Then follow [AZURE_KEY_VAULT_SETUP.md](AZURE_KEY_VAULT_SETUP.md) to configure Key Vault.

### ✨ Key Improvements

1. **Single Deployment** - Frontend + Backend in one place
2. **Unified Server** - Express handles both static and API requests
3. **Automatic Function Loading** - Functions automatically mounted at `/api/{functionName}`
4. **SPA Support** - Proper routing for single-page application
5. **Backward Compatible** - Existing API and frontend code unchanged

### 🧪 Testing Locally

```bash
# Install dependencies (including API)
npm install
npm --prefix ./api install

# Start the server
npm start

# Server runs on http://localhost:3000
# Frontend: http://localhost:3000
# API: http://localhost:3000/api/{functionName}
```

### 📊 Deployment Log Info

From your deployment log:
- Deployment tool: **OneDeploy** ✓
- Target: **App Service** ✓
- Runtime: **Node.js v22.17.0** ✓
- Deployment time: ~12 minutes ✓

### 🔍 Monitoring

After deployment, check:

1. **App Service URL**: https://caidrcustomermodel-{id}.azurewebsites.net
2. **Log Stream**: Azure Portal → App Service → Log Stream
3. **Deployment Logs**: Azure Portal → App Service → Deployment Center

### ❌ Old Configuration (Removed)

- ~~Static Web App~~ → Now uses App Service
- ~~`data-storage.js` entry point~~ → Now uses `server.js`
- ~~Static file serving only~~ → Now serves static + API
- ~~Separate API deployment~~ → API deployed with main app

### ✅ Next Steps

1. Verify `package.json` changes look correct
2. Commit and push to GitHub
3. Monitor GitHub Actions workflow
4. Check deployment logs if issues occur
5. Visit your App Service URL to verify app is running
6. Test API endpoints: `POST /api/{functionName}`

### 📚 Documentation

- [App Service Deployment Guide](APP_SERVICE_DEPLOYMENT.md) - Complete setup guide
- [Azure Key Vault Setup](AZURE_KEY_VAULT_SETUP.md) - Secure credential management
- [Existing README](README.md) - Application overview

---

**Status**: ✅ Ready for deployment to Azure App Service
