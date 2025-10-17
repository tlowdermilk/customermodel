// Shared wrapper for Key Vault functionality
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

let secretClient = null;
let keyVaultInitialized = false;

/**
 * Initialize the Key Vault client
 * Uses DefaultAzureCredential which supports:
 * - Managed Identity (in Azure)
 * - Service Principal
 * - User authentication (local development)
 */
function initializeKeyVault() {
  if (keyVaultInitialized) {
    return secretClient !== null;
  }

  if (!process.env.KEY_VAULT_URL) {
    console.log('KEY_VAULT_URL not set. Using environment variables for configuration.');
    keyVaultInitialized = true;
    return false;
  }

  try {
    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(process.env.KEY_VAULT_URL, credential);
    keyVaultInitialized = true;
    console.log('Key Vault client initialized successfully');
    return true;
  } catch (error) {
    console.warn('Failed to initialize Key Vault client:', error.message);
    keyVaultInitialized = true;
    return false;
  }
}

/**
 * Retrieve a secret from Key Vault
 * @param {string} secretName - The name of the secret in Key Vault
 * @returns {Promise<string>} The secret value
 */
async function getSecret(secretName) {
  if (!secretClient) {
    throw new Error('Key Vault not available. Ensure KEY_VAULT_URL is set and Key Vault is initialized.');
  }

  try {
    const secret = await secretClient.getSecret(secretName);
    return secret.value;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName} from Key Vault:`, error.message);
    throw error;
  }
}

/**
 * Load all database credentials from Key Vault or environment variables
 * @returns {Promise<object>} Database configuration object
 */
async function loadDatabaseConfig() {
  // Initialize Key Vault if not already done
  if (!keyVaultInitialized) {
    initializeKeyVault();
  }

  // If Key Vault is available, try to get secrets from there
  if (secretClient) {
    try {
      console.log('Attempting to load database configuration from Key Vault...');
      const [host, port, user, password, name] = await Promise.all([
        getSecret('db-host'),
        getSecret('db-port'),
        getSecret('db-user'),
        getSecret('db-password'),
        getSecret('db-name')
      ]);

      console.log('Successfully loaded database configuration from Key Vault');
      return {
        host,
        port: parseInt(port),
        user,
        password,
        database: name,
        ssl: process.env.DB_SSL === 'true',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
    } catch (error) {
      console.warn('Failed to load credentials from Key Vault, falling back to environment variables:', error.message);
    }
  }

  // Fallback to environment variables (local development or Key Vault failure)
  console.log('Using database configuration from environment variables');
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

module.exports = {
  initializeKeyVault,
  getSecret,
  loadDatabaseConfig
};
