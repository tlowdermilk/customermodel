/**
 * API Client Module
 * Handles all communication with the Azure Functions backend
 */

const API = (function() {
  // Base URL for API - configurable for different environments
  // For local development, use the same server (port 3000)
  // For production (Azure), use relative path '/api'
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.startsWith('10.') ||
                     window.location.hostname.startsWith('192.168.');
  
  const BASE_URL = isLocalDev
    ? 'http://localhost:3000/api'   // Local development (Express server)
    : '/api';                         // Production (Azure App Service)
  
  console.log(`API Client initialized with BASE_URL: ${BASE_URL}`);
  
  /**
   * Generic fetch wrapper with error handling
   */
  async function apiFetch(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (response.status === 204) {
        return null; // No content
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // ============= PROFILES API =============
  
  async function getProfiles() {
    return await apiFetch('/profiles');
  }
  
  async function getProfile(profileKey) {
    return await apiFetch(`/profiles/${profileKey}`);
  }
  
  async function createProfile(data) {
    return await apiFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async function updateProfile(profileKey, data) {
    return await apiFetch(`/profiles/${profileKey}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async function deleteProfile(profileKey) {
    return await apiFetch(`/profiles/${profileKey}`, {
      method: 'DELETE'
    });
  }
  
  // ============= SCENARIOS API =============
  
  async function getScenarios(profileKey = null) {
    const endpoint = profileKey ? `/scenarios/${profileKey}` : '/scenarios';
    return await apiFetch(endpoint);
  }
  
  async function getScenario(profileKey, scenarioKey) {
    return await apiFetch(`/scenarios/${profileKey}/${scenarioKey}`);
  }
  
  async function createScenario(profileKey, data) {
    return await apiFetch(`/scenarios/${profileKey}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async function updateScenario(profileKey, scenarioKey, data) {
    return await apiFetch(`/scenarios/${profileKey}/${scenarioKey}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async function deleteScenario(profileKey, scenarioKey) {
    return await apiFetch(`/scenarios/${profileKey}/${scenarioKey}`, {
      method: 'DELETE'
    });
  }
  
  // ============= WORKFLOW STEPS API =============
  
  async function getWorkflowSteps(profileKey, scenarioKey) {
    return await apiFetch(`/workflow-steps/${profileKey}/${scenarioKey}`);
  }
  
  async function saveWorkflowSteps(profileKey, scenarioKey, steps) {
    return await apiFetch(`/workflow-steps/${profileKey}/${scenarioKey}`, {
      method: 'POST',
      body: JSON.stringify({ steps })
    });
  }
  
  async function deleteWorkflowSteps(profileKey, scenarioKey) {
    return await apiFetch(`/workflow-steps/${profileKey}/${scenarioKey}`, {
      method: 'DELETE'
    });
  }
  
  // ============= PRODUCTS API =============
  
  async function getProducts() {
    return await apiFetch('/products');
  }
  
  async function getProduct(productKey) {
    return await apiFetch(`/products/${productKey}`);
  }
  
  async function createProduct(data) {
    return await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async function updateProduct(productKey, data) {
    return await apiFetch(`/products/${productKey}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async function deleteProduct(productKey) {
    return await apiFetch(`/products/${productKey}`, {
      method: 'DELETE'
    });
  }
  
  // ============= VOCABULARIES API =============
  
  async function getVocabularies() {
    return await apiFetch('/vocabularies');
  }
  
  async function getDevApproaches() {
    return await apiFetch('/vocabularies/dev-approaches');
  }
  
  async function getPartnerApproaches() {
    return await apiFetch('/vocabularies/partner-approaches');
  }
  
  // Public API
  return {
    // Profiles
    getProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    
    // Scenarios
    getScenarios,
    getScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    
    // Workflow Steps
    getWorkflowSteps,
    saveWorkflowSteps,
    deleteWorkflowSteps,
    
    // Products
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Vocabularies
    getVocabularies,
    getDevApproaches,
    getPartnerApproaches
  };
})();

// Make API available globally
window.API = API;
