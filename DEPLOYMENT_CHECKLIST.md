# Pre-Deployment Checklist for Azure App Service

Use this checklist to ensure everything is configured correctly before deploying to Azure App Service.

## ✅ Code Changes

- [x] **`server.js`** created - Express server for App Service
- [x] **`web.config`** created - IIS configuration for Node.js
- [x] **`.deployment`** created - Deployment configuration
- [x] **`package.json`** updated - Correct main entry point and scripts
- [x] **Documentation** created - Deployment guides

## 🔧 Configuration Setup

### In Your App Service → Configuration → Application Settings

**Add these variables:**

- [ ] `NODE_ENV`: `production`
- [ ] `PORT`: (leave empty - App Service sets this automatically)

**Option A - Direct Database Credentials:**
- [ ] `DB_HOST`: Your database host
- [ ] `DB_PORT`: `3306`
- [ ] `DB_USER`: Your database username
- [ ] `DB_PASS`: Your database password
- [ ] `DB_NAME`: `customermodel`
- [ ] `DB_SSL`: `true`

**Option B - Azure Key Vault (Recommended):**
- [ ] `KEY_VAULT_URL`: `https://your-keyvault.vault.azure.net/`
- [ ] Follow [AZURE_KEY_VAULT_SETUP.md](AZURE_KEY_VAULT_SETUP.md) for complete setup

## 📦 Dependencies

Verify your packages are correct:

**Root package.json should have:**
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "npm --prefix ./api install",
    "test": "echo \"Error: no test specified\" && exit 0"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "mysql2": "^3.15.2"
  }
}
```

**API package.json should have:**
- [ ] `@azure/functions`: `^4.0.0`
- [ ] `@azure/identity`: `^4.0.0` (for Key Vault)
- [ ] `@azure/keyvault-secrets`: `^4.8.0` (for Key Vault)
- [ ] `mysql2`: `^3.6.0`
- [ ] `dotenv`: `^16.3.1`

## 🌐 Database Connectivity

- [ ] Database host/port is accessible from App Service
- [ ] Database username and password are correct
- [ ] Database SSL setting matches your database configuration
- [ ] Firewall rules allow App Service IP address (if using IP-based firewall)

## 📝 GitHub Actions Workflow

In `.github/workflows/main_caidrcustomermodel.yml` (or your workflow file):

- [ ] Build step runs: `npm run build`
- [ ] Deployment uses: `azure/webapps-deploy@v3`
- [ ] Correct app name: `caidrcustomermodel`
- [ ] Correct resource group configured

## 🚀 Deployment Steps

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Configure for Azure App Service deployment"
   git push origin main
   ```

2. **Monitor GitHub Actions:**
   - Go to your repo → Actions tab
   - Watch the workflow execute
   - Check deployment logs for errors

3. **Verify in Azure:**
   - Go to App Service → Overview
   - Click the URL to visit your app
   - Should see index.html (the UX tool interface)

4. **Test the API:**
   - Open browser console (F12)
   - Check for any API errors
   - Verify data loads from database

## 🔍 Troubleshooting Deployment

### If build fails:
- Check GitHub Actions logs
- Verify `package.json` syntax is valid
- Ensure API dependencies install successfully

### If app doesn't start:
- Check App Service → Log Stream
- Look for "Cannot find module" errors
- Verify all dependencies are in `node_modules`

### If static files not loading:
- Check that `index.html` exists in root
- Verify `web.config` is deployed
- Check browser console for 404 errors

### If API calls fail:
- Check database credentials in Configuration
- Verify database is accessible from App Service
- Look for connection errors in Log Stream

### If Key Vault not working:
- Verify Managed Identity is enabled on App Service
- Check Key Vault access policies include App Service identity
- Verify `KEY_VAULT_URL` is set correctly

## 📊 Post-Deployment Verification

After successful deployment:

- [ ] App loads at `https://your-app-service-url/`
- [ ] Frontend displays correctly
- [ ] Can select presets, scenarios, products
- [ ] Workflow visualization appears
- [ ] No errors in browser console
- [ ] API requests succeed (check Network tab)
- [ ] Database queries work
- [ ] App Service logs show successful startup

## 📞 Useful Azure CLI Commands

```powershell
# View app service logs
az webapp log tail --resource-group your-resource-group --name caidrcustomermodel

# View app service configuration
az webapp config appsettings list --resource-group your-resource-group --name caidrcustomermodel

# Restart app service
az webapp restart --resource-group your-resource-group --name caidrcustomermodel

# View deployment history
az webapp deployment list --resource-group your-resource-group --name caidrcustomermodel

# Test connectivity to app
curl https://your-app-service-url/
```

## ✨ Performance Tips

- [ ] Enable Application Insights for monitoring
- [ ] Configure auto-scale if expecting variable load
- [ ] Consider Always On setting for consistent performance
- [ ] Set up alerts for high error rates or slow response times

## 🔒 Security Checklist

- [ ] Set `NODE_ENV: production`
- [ ] Use Key Vault for credentials (not hardcoded)
- [ ] Enable HTTPS only in App Service settings
- [ ] Review CORS settings in `server.js`
- [ ] Enable authentication if needed
- [ ] Set up Web Application Firewall (WAF) if needed

## 📚 Documentation Reference

- **[APP_SERVICE_MIGRATION.md](APP_SERVICE_MIGRATION.md)** - What changed and why
- **[APP_SERVICE_DEPLOYMENT.md](APP_SERVICE_DEPLOYMENT.md)** - Detailed deployment guide
- **[AZURE_KEY_VAULT_SETUP.md](AZURE_KEY_VAULT_SETUP.md)** - Key Vault configuration
- **[README.md](README.md)** - Application overview

---

**Ready to deploy?**

1. ✅ Verify all checkboxes above
2. ✅ Commit and push to GitHub
3. ✅ Monitor GitHub Actions
4. ✅ Visit your app URL to verify

Need help? Check the troubleshooting section or review the deployment logs in GitHub Actions and Azure App Service.
