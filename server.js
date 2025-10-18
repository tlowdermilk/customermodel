/**
 * Express server for Azure App Service
 * Serves static frontend files and proxies API requests to Azure Functions handlers
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import API handlers directly
let productsHandler, profilesHandler, scenariosHandler, workflowStepsHandler, vocabulariesHandler;

try {
  productsHandler = require('./api/src/handlers/products');
  profilesHandler = require('./api/src/handlers/profiles');
  scenariosHandler = require('./api/src/handlers/scenarios');
  workflowStepsHandler = require('./api/src/handlers/workflow-steps');
  vocabulariesHandler = require('./api/src/handlers/vocabularies');
  console.log('API handlers imported successfully');
} catch (err) {
  console.error('Failed to import API handlers:', err.message);
  process.exit(1);
}

/**
 * Adapter to convert Express request to Azure Functions format
 */
function createAzureFunctionRequest(expressReq) {
  const url = expressReq.originalUrl || '';
  const pathSegments = url.split('/').filter(Boolean);
  
  return {
    method: expressReq.method,
    url: url,
    headers: expressReq.headers,
    query: expressReq.query,
    params: expressReq.params,
    body: expressReq.body,
    // Extract parameters from URL path (e.g., /api/products/123 -> productKey: 123)
    // This is simplified; you may need to adjust based on your URL patterns
    json: async () => expressReq.body || {}
  };
}

/**
 * Context object matching Azure Functions expectations
 */
function createContext() {
  return {
    log: console.log,
    error: console.error,
    info: console.info,
    warn: console.warn
  };
}

/**
 * Handler wrapper to convert Azure Functions response to Express
 */
async function handleAzureFunction(handler, req, res) {
  try {
    const azureReq = createAzureFunctionRequest(req);
    const context = createContext();
    
    const result = await handler(azureReq, context);
    
    if (result) {
      const status = result.status || 200;
      const headers = result.headers || { 'Content-Type': 'application/json' };
      const body = result.body ? 
        (typeof result.body === 'string' ? JSON.parse(result.body) : result.body) : 
        result;
      
      res.status(status).set(headers).json(body);
    } else {
      res.status(204).end();
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// API Routes - Mount handlers with proper route matching
app.all('/api/products', (req, res) => handleAzureFunction(productsHandler.handler, req, res));
app.all('/api/products/:productKey', (req, res) => handleAzureFunction(productsHandler.handler, req, res));
app.all('/api/profiles', (req, res) => handleAzureFunction(profilesHandler.handler, req, res));
app.all('/api/profiles/:profileKey', (req, res) => handleAzureFunction(profilesHandler.handler, req, res));
app.all('/api/scenarios', (req, res) => handleAzureFunction(scenariosHandler.handler, req, res));
app.all('/api/scenarios/:scenarioKey', (req, res) => handleAzureFunction(scenariosHandler.handler, req, res));
app.all('/api/workflow-steps', (req, res) => handleAzureFunction(workflowStepsHandler.handler, req, res));
app.all('/api/workflow-steps/:workflowStepKey', (req, res) => handleAzureFunction(workflowStepsHandler.handler, req, res));
app.all('/api/vocabularies', (req, res) => handleAzureFunction(vocabulariesHandler.handler, req, res));
app.all('/api/vocabularies/:vocabularyKey', (req, res) => handleAzureFunction(vocabulariesHandler.handler, req, res));

// Serve static files from root directory
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  etag: false
}));

// Serve index.html for all unmatched routes (SPA fallback)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Static files served from: ${__dirname}`);
  console.log(`API routes registered:`);
  console.log(`  - /api/products`);
  console.log(`  - /api/profiles`);
  console.log(`  - /api/scenarios`);
  console.log(`  - /api/workflow-steps`);
  console.log(`  - /api/vocabularies`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

