# Azure App Service Deployment Configuration

This guide explains how to configure your Azure App Service to run the Customer Model application.

## Project Structure for App Service

```
/
├── server.js                    # Express server entry point (main app)
├── index.html                   # Frontend application
├── api-client.js               # Frontend API client
├── data-transform.js           # Data transformation utilities
├── package.json                # Root dependencies (Express, CORS, MySQL2)
├── web.config                  # IIS configuration for App Service
├── .deployment                 # Deployment configuration
├── api/                        # Azure Functions (API routes)
│   ├── package.json           # API dependencies
│   ├── local.settings.json    # Local environment variables
│   └── src/
│       ├── app.js             # API application
│       ├── functions/         # HTTP-triggered functions
│       └── config/
│           └── keyVault.js    # Key Vault configuration
└── shared/
    ├── db.js                  # Database connection pool
    └── keyVault.js            # Shared Key Vault module
```

## Deployment Flow

1. **Build Step** (`npm run build`)
   - Installs dependencies in `/api` folder
   
2. **Start Step** (`npm start`)
   - Starts Express server (`node server.js`)
   - Serves static files from root directory
   - API functions mounted at `/api/*`

## Environment Variables Configuration

In Azure App Service → Configuration → Application Settings, add:

### Database Configuration (choose one approach)

#### Option A: Direct Credentials (Local/Development Only)
```
DB_HOST: your-database-host
DB_PORT: 3306
DB_USER: your-username
DB_PASS: your-password
DB_NAME: customermodel
DB_SSL: true
NODE_ENV: production
```

#### Option B: Azure Key Vault (Recommended for Production)
```
KEY_VAULT_URL: https://your-keyvault.vault.azure.net/
NODE_ENV: production
```

Then follow the [Azure Key Vault Setup Guide](AZURE_KEY_VAULT_SETUP.md) to:
- Create secrets in Key Vault
- Grant App Service Managed Identity access to Key Vault

## Application Startup

### What Happens When App Service Starts

1. **iisnode** intercepts requests to `server.js`
2. **Express server** starts on port determined by `PORT` environment variable (default: 3000)
3. **Static middleware** serves files from root directory (`index.html`, CSS, JS)
4. **API functions** are mounted at `/api/{functionName}` routes
5. **Database pool** is initialized on first database query (loads credentials from Key Vault or env vars)

### Logging & Debugging

Check logs in Azure Portal:
- **Log Stream** → Real-time application output
- **App Service logs** → Persistent logs
- **Application Insights** → Performance monitoring (if enabled)

## File Descriptions

### `server.js`
- Main Express application
- Serves static files (frontend)
- Routes API requests to functions
- Handles SPA fallback (all routes redirect to index.html)

### `web.config`
- IIS configuration for Node.js apps
- Configures iisnode to proxy requests
- Enables WebSocket, compression, and caching
- Prevents node_modules from being served

### `.deployment`
- Tells App Service which build command to run
- Runs `npm run build` before starting app

## Common Issues & Solutions

### "Cannot find module 'express'"
- **Cause**: Dependencies not installed
- **Solution**: Ensure `npm install` runs during build. Check that `node_modules` folder is present.

### "PORT already in use"
- **Cause**: Azure already assigns a port
- **Solution**: Use `PORT` environment variable. App Service sets this automatically.

### "Static files (index.html, CSS) not loading"
- **Cause**: Server not configured to serve static files
- **Solution**: Check `web.config` iisnode configuration. Ensure `server.js` uses `express.static()`.

### "API endpoints returning 404"
- **Cause**: Functions not found in `/api/src/functions/` or routes misconfigured
- **Solution**: Verify function files exist. Check function exports are correct.

### "Database connection fails in Azure"
- **Cause**: Credentials not set or Key Vault not accessible
- **Solution**: 
  1. Set `DB_HOST`, `DB_USER`, `DB_PASS` in App Service Configuration
  2. Or set `KEY_VAULT_URL` and grant Managed Identity access
  3. Check firewall rules allow App Service IP

## Monitoring & Scaling

### Enable Application Insights
```powershell
az webapp config appsettings set `
  --resource-group your-resource-group `
  --name your-app-service-name `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=your-key
```

### Scale Up (Increase Resources)
```powershell
az appservice plan update `
  --name your-app-service-plan `
  --resource-group your-resource-group `
  --sku P1V2
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure Key Vault (not direct credentials)
- [ ] Enable HTTPS only in App Service settings
- [ ] Set up Application Insights
- [ ] Configure continuous deployment (GitHub Actions)
- [ ] Set up automated backups for database
- [ ] Configure scaling rules if needed
- [ ] Set up monitoring alerts
- [ ] Review and restrict CORS origins in `server.js`

## Next Steps

1. Push changes to GitHub
2. GitHub Actions will automatically deploy to App Service
3. Monitor deployment in GitHub Actions logs
4. Check App Service Application URL to verify app is running
5. Review App Service logs if issues occur
