// Central registration file for all Azure Functions v4
const { app } = require('@azure/functions');

// Import all handlers
const productsHandler = require('./handlers/products');
const profilesHandler = require('./handlers/profiles');
const scenariosHandler = require('./handlers/scenarios');
const workflowStepsHandler = require('./handlers/workflow-steps');
const vocabulariesHandler = require('./handlers/vocabularies');

// Register Products function
app.http('products', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: 'products/{productKey?}',
    handler: productsHandler.handler
});

// Register Profiles function
app.http('profiles', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: 'profiles/{profileKey?}',
    handler: profilesHandler.handler
});

// Register Scenarios function
app.http('scenarios', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: 'scenarios/{profileKey?}/{scenarioKey?}',
    handler: scenariosHandler.handler
});

// Register Workflow Steps function
app.http('workflowSteps', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: 'workflow-steps/{profileKey?}/{scenarioKey?}',
    handler: workflowStepsHandler.handler
});

// Register Vocabularies function
app.http('vocabularies', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'vocabularies/{type?}',
    handler: vocabulariesHandler.handler
});
