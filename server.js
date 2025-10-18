/**
 * Express server for Azure App Service
 * Serves static frontend files and API routes
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  etag: false
}));

// API routes - import and mount the API functions
// Load all HTTP-triggered functions from the api/src/functions directory
const functionsDir = path.join(__dirname, 'api', 'src', 'functions');

if (fs.existsSync(functionsDir)) {
  fs.readdirSync(functionsDir).forEach(file => {
    if (file.endsWith('.js')) {
      const functionName = path.parse(file).name;
      try {
        const functionModule = require(path.join(functionsDir, file));
        
        // Functions should export a handler or trigger configuration
        if (functionModule.handler) {
          // Mount at /api/{functionName}
          app.post(`/api/${functionName}`, async (req, res) => {
            try {
              const result = await functionModule.handler(req, res);
              if (result) {
                res.json(result);
              }
            } catch (error) {
              console.error(`Error in ${functionName}:`, error);
              res.status(500).json({ error: error.message });
            }
          });
          console.log(`Mounted API function: /api/${functionName}`);
        }
      } catch (error) {
        console.warn(`Failed to load function ${file}:`, error.message);
      }
    }
  });
}

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
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Static files served from: ${__dirname}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
