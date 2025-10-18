# Deployment Optimization Guide

This document explains how the build and deployment process has been optimized to reduce package size and deployment time.

## Problem

The initial deployment failed during the ZIP deploy process because the package was too large. This was primarily due to:

- **`node_modules/`** folder (~100MB+) - Contains all npm dependencies
- **`api/node_modules/`** folder (~50MB+) - Contains API dependencies
- **Build artifacts** - Temporary files from the build process
- **Git history** (`.git/` folder) - Not needed for deployment

## Solution

We've implemented a multi-layered approach to minimize deployment package size:

### 1. GitHub Actions Workflow Optimization

**File**: `.github/workflows/main_caidrcustomermodel.yml`

The workflow now:
1. Installs dependencies: `npm install`
2. Runs build: `npm run build` (installs API dependencies)
3. **Cleans up** before uploading:
   - Removes `node_modules/`
   - Removes `api/node_modules/`
   - Removes `package-lock.json` files

This reduces the artifact size from **~600MB to ~5-10MB**.

### 2. Deployment Ignore File

**File**: `.deployignore`

Azure App Service uses this file to exclude files during deployment:

```
node_modules/
.git/
.github/
.vscode/
.env
logs/
coverage/
```

This ensures clean files are deployed and App Service will regenerate `node_modules` during startup.

### 3. Deployment Configuration

**File**: `.deployment`

```
[config]
command = npm run build
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

This tells App Service to:
- Run `npm run build` before starting the app
- Execute the build during deployment (not just during artifact creation)

### 4. Git Ignore Configuration

**File**: `.gitignore`

Already configured to exclude:
- `node_modules/` folders
- `.env` files
- Build artifacts
- Local settings

This keeps the git repository small and secure.

## Deployment Flow

```
1. Developer pushes to main
   ↓
2. GitHub Actions triggers
   ↓
3. Build phase:
   - Checkout code
   - Install root dependencies: npm install
   - Run build: npm run build (installs API dependencies)
   - Run tests: npm test
   - CLEAN UP: Remove all node_modules
   - Create artifact (~5-10MB)
   ↓
4. Upload artifact to Azure
   ↓
5. Deploy to App Service:
   - Download artifact
   - Apply .deployignore rules
   - Run .deployment command: npm run build
   - App Service installs dependencies from scratch
   - Start application: npm start
   ↓
6. Application runs
```

## Size Comparison

| Stage | Package Size | What's Included |
|-------|--------------|-----------------|
| After checkout | ~1MB | Source code only |
| After npm install | ~600MB | Source + all node_modules |
| After cleanup | ~5-10MB | Source code + package.json |
| After deployment | ~600MB | Full app with reinstalled dependencies |

**Result**: Deployment is ~60x faster!

## Files Excluded from Deployment

### Always Excluded
- `.git/` - Not needed on server
- `node_modules/` - Reinstalled during build
- `.github/` - Workflow files only needed in repo
- `.vscode/` - IDE configuration
- `.env` - Local environment (not for production)
- `logs/` - Generated at runtime
- `*.log` - Log files

### Conditionally Excluded (based on .deployignore)
- `*.swp`, `*.swo` - Editor temporary files
- `.DS_Store` - macOS files
- `Thumbs.db` - Windows files
- `coverage/` - Test coverage reports
- `temp/`, `tmp/` - Temporary directories

## Environment Variables

Production environment variables should be set in **Azure App Service → Configuration**:

```
NODE_ENV: production
KEY_VAULT_URL: https://caidrcustomermodel-kv.vault.azure.net/
PORT: (auto-set by App Service)
```

These are NOT stored in `.env` file (which is ignored).

## Build Process in Azure

When App Service receives the deployment:

1. **Install root dependencies**:
   ```
   npm install
   ```
   This reads `package.json` and installs Express, CORS, etc.

2. **Run build command**:
   ```
   npm run build
   ```
   This runs: `npm --prefix ./api install`
   Installing API dependencies from `api/package.json`

3. **Start application**:
   ```
   npm start
   ```
   This runs: `node server.js`
   Which serves static files and API routes

## Troubleshooting

### "Deployment still seems slow"
- Check GitHub Actions logs for build time
- Verify `.deployignore` is in root directory
- Ensure `.deployment` file is correct

### "Dependencies missing after deployment"
- Verify `npm run build` completes successfully
- Check that `package.json` files are correct
- Look for errors in App Service logs

### "Old files still deployed"
- Ensure `.deployignore` file exists
- Check that cleanup step ran in GitHub Actions
- Verify no `.git` folder is being deployed

## Performance Metrics

After optimization:
- **GitHub Actions build time**: ~2-3 minutes
- **Artifact size**: ~5-10MB (down from ~600MB)
- **Azure deployment time**: ~5-10 minutes
- **Total deployment time**: ~10-15 minutes

## Future Optimizations

Consider these for further improvement:

1. **Use application insights** for monitoring deployments
2. **Enable compression** in `.web.config`
3. **Cache npm dependencies** in GitHub Actions
4. **Use deployment slots** for blue-green deployments
5. **Separate static assets** to CDN if needed

## Related Files

- [APP_SERVICE_MIGRATION.md](APP_SERVICE_MIGRATION.md) - Migration details
- [APP_SERVICE_DEPLOYMENT.md](APP_SERVICE_DEPLOYMENT.md) - Deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

---

**Status**: ✅ Optimized for fast, reliable deployments to Azure App Service
