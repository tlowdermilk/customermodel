# Azure Key Vault Integration Guide

This document explains how to set up Azure Key Vault for the Customer Model application.

## Overview

The application now supports two credential sources:
- **Local Development**: Uses `local.settings.json` (environment variables)
- **Azure Production**: Uses Azure Key Vault with Managed Identity

## Local Development (No Changes Required)

Your `api/local.settings.json` file already contains the database credentials. No additional setup is needed for local development.

```bash
npm start  # Uses credentials from local.settings.json
```

## Azure Production Setup

### Step 1: Create an Azure Key Vault

```powershell
$resourceGroup = "your-resource-group"
$keyVaultName = "customermodel-kv"  # Must be globally unique
$location = "East US"

az keyvault create `
  --name $keyVaultName `
  --resource-group $resourceGroup `
  --location $location
```

### Step 2: Add Database Secrets to Key Vault

```powershell
$keyVaultName = "customermodel-kv"

# Add each database credential as a secret
az keyvault secret set `
  --vault-name $keyVaultName `
  --name "db-host" `
  --value "caiduxr-server.mysql.database.azure.com"

az keyvault secret set `
  --vault-name $keyVaultName `
  --name "db-port" `
  --value "3306"

az keyvault secret set `
  --vault-name $keyVaultName `
  --name "db-user" `
  --value "your-database-username"

az keyvault secret set `
  --vault-name $keyVaultName `
  --name "db-password" `
  --value "your-database-password"

az keyvault secret set `
  --vault-name $keyVaultName `
  --name "db-name" `
  --value "customermodel"
```

### Step 3: Configure Azure Static Web App

Add the Key Vault URL as an application setting in your Azure Static Web App:

**Via Azure Portal:**
1. Navigate to your Static Web App resource
2. Go to **Configuration** → **Application Settings**
3. Add a new setting:
   - **Name**: `KEY_VAULT_URL`
   - **Value**: `https://{keyVaultName}.vault.azure.net/`

**Via Azure CLI:**
```powershell
$staticWebAppName = "your-static-web-app-name"
$resourceGroup = "your-resource-group"
$keyVaultName = "customermodel-kv"

az staticwebapp appsettings set `
  --name $staticWebAppName `
  --resource-group $resourceGroup `
  --setting-names KEY_VAULT_URL=https://$keyVaultName.vault.azure.net/
```

### Step 4: Grant Managed Identity Access to Key Vault

Enable Managed Identity on your Static Web App and grant it access to Key Vault secrets:

```powershell
$staticWebAppName = "your-static-web-app-name"
$resourceGroup = "your-resource-group"
$keyVaultName = "customermodel-kv"

# Get the principal ID of the Static Web App's managed identity
$principalId = az resource show `
  --name $staticWebAppName `
  --resource-group $resourceGroup `
  --resource-type "Microsoft.Web/staticSites" `
  --query identity.principalId `
  -o tsv

# Grant the managed identity permission to read secrets from Key Vault
az keyvault set-policy `
  --name $keyVaultName `
  --object-id $principalId `
  --secret-permissions get list
```

## How It Works

### Credential Loading Flow

1. **Application starts** → Key Vault client is initialized (if `KEY_VAULT_URL` is set)
2. **Database connection requested** → `loadDatabaseConfig()` is called
3. **If Key Vault available** → Secrets are fetched from Key Vault
4. **If Key Vault fails or unavailable** → Falls back to environment variables
5. **Connection pool** → Created with loaded credentials

### Code Changes

The following files were modified:

- **`api/package.json`** - Added Azure Key Vault dependencies
- **`api/shared/keyVault.js`** - New module for Key Vault operations
- **`api/shared/db.js`** - Updated to use Key Vault for credentials
- **`api/local.settings.json`** - Added `NODE_ENV` setting

## Troubleshooting

### "Key Vault client not initialized"
- Ensure `KEY_VAULT_URL` environment variable is set in Azure
- Check that the Static Web App has a system-assigned managed identity

### "Failed to retrieve secret from Key Vault"
- Verify the secret names match exactly (case-sensitive):
  - `db-host`
  - `db-port`
  - `db-user`
  - `db-password`
  - `db-name`
- Ensure the managed identity has `get` and `list` permissions on Key Vault secrets

### "Failed to retrieve secret, falling back to environment variables"
- This is expected in local development or if Key Vault is unavailable
- The application will use credentials from `local.settings.json` instead

## Security Best Practices

✅ **Do:**
- Store all sensitive credentials in Key Vault
- Use Managed Identity (no hard-coded credentials)
- Enable Key Vault soft-delete and purge protection
- Regularly rotate secrets
- Use separate Key Vaults for development and production

❌ **Don't:**
- Store credentials in config files or source code
- Commit `local.settings.json` with real credentials to version control
- Share Key Vault access across multiple applications without need

## Testing

### Test Local Development
```bash
cd api
npm install
npm start
# Should use credentials from local.settings.json
```

### Test Production (in Azure)
1. Deploy the application to Azure Static Web App
2. Check the Function App logs to verify Key Vault initialization
3. Verify database queries work correctly

## Reverting to Environment Variables Only

If you need to use only environment variables (no Key Vault):
1. Don't set `KEY_VAULT_URL` environment variable
2. The application will automatically fall back to using environment variables
3. Works in both local and Azure environments

## Additional Resources

- [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)
- [Azure Managed Identity](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/)
- [Azure SDK for Node.js - Key Vault](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/keyvault/keyvault-secrets)
