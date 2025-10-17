/**
 * Data Transformation Module
 * Converts between database structure and frontend structure
 */

const DataTransform = (function() {
  
  /**
   * Transform database profiles to frontend format
   * Database: profiles table with profile_key, expertise, aicapability, governance
   * Frontend: presetFactors[profile_key] = { expertise, aicapability, governance }
   */
  function dbProfilesToFrontend(profiles) {
    const presetFactors = {};
    const presetMetadata = {};
    const presets = {}; // Legacy, kept for compatibility
    
    profiles.forEach(profile => {
      presetFactors[profile.profile_key] = {
        expertise: profile.expertise,
        aicapability: profile.aicapability,
        governance: profile.governance
      };
      
      presetMetadata[profile.profile_key] = profile.display_name;
      presets[profile.profile_key] = []; // Empty array for legacy compatibility
    });
    
    return { presetFactors, presetMetadata, presets };
  }
  
  /**
   * Transform database scenarios to frontend format
   * Database: scenarios table with profile_key, scenario_key, importance, complexity, maturity
   * Frontend: 
   *   - scenarioFactors["profile:scenario"] = { importance, complexity, maturity }
   *   - scenarioMetadata[profile] = { scenario: "Display Name" }
   */
  function dbScenariosToFrontend(scenarios) {
    const scenarioFactors = {};
    const scenarioMetadata = {};
    
    scenarios.forEach(scenario => {
      const compositeKey = `${scenario.profile_key}:${scenario.scenario_key}`;
      
      scenarioFactors[compositeKey] = {
        importance: scenario.importance,
        complexity: scenario.complexity,
        maturity: scenario.maturity
      };
      
      // Initialize profile metadata if not exists
      if (!scenarioMetadata[scenario.profile_key]) {
        scenarioMetadata[scenario.profile_key] = {};
      }
      
      scenarioMetadata[scenario.profile_key][scenario.scenario_key] = scenario.display_name;
    });
    
    return { scenarioFactors, scenarioMetadata };
  }
  
  /**
   * Transform database workflow steps to frontend format
   * Database: workflow_steps with profile_key, scenario_key, dev_approach_slug, partner_approach_slug
   * Frontend: workflows["profile:scenario"] = [["Role", "Focus"], ...]
   */
  function dbWorkflowStepsToFrontend(workflowSteps, vocabularies) {
    const workflows = {};
    
    // Group by profile:scenario
    const grouped = {};
    workflowSteps.forEach(step => {
      const key = `${step.profile_key}:${step.scenario_key}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(step);
    });
    
    // Convert to frontend format
    Object.keys(grouped).forEach(compositeKey => {
      const steps = grouped[compositeKey];
      
      // Sort by step_index
      steps.sort((a, b) => a.step_index - b.step_index);
      
      // Convert to [["Role Name", "Focus Name"], ...] format
      workflows[compositeKey] = steps.map(step => {
        const devApproach = vocabularies.dev_approaches.find(
          da => da.slug === step.dev_approach_slug
        );
        const partnerApproach = vocabularies.partner_approaches.find(
          pa => pa.slug === step.partner_approach_slug
        );
        
        return [
          devApproach ? devApproach.name : step.dev_approach_slug,
          partnerApproach ? partnerApproach.name : step.partner_approach_slug
        ];
      });
    });
    
    return workflows;
  }
  
  /**
   * Transform database products to frontend format
   * Database: products with capabilities array
   * Frontend: productCapabilities[product_key] = [["Role", "Focus"], ...]
   */
  function dbProductsToFrontend(products, vocabularies) {
    const productCapabilities = {};
    const productMetadata = {};
    
    products.forEach(product => {
      productMetadata[product.product_key] = product.display_name;
      
      // Transform capabilities
      if (product.capabilities && product.capabilities.length > 0) {
        productCapabilities[product.product_key] = product.capabilities.map(cap => {
          const devApproach = vocabularies.dev_approaches.find(
            da => da.slug === cap.dev_approach_slug
          );
          const partnerApproach = vocabularies.partner_approaches.find(
            pa => pa.slug === cap.partner_approach_slug
          );
          
          return [
            devApproach ? devApproach.name : cap.dev_approach_slug,
            partnerApproach ? partnerApproach.name : cap.partner_approach_slug
          ];
        });
      } else {
        productCapabilities[product.product_key] = [];
      }
    });
    
    return { productCapabilities, productMetadata };
  }
  
  /**
   * Transform frontend profile data to database format
   */
  function frontendProfileToDb(profileKey, presetFactors, presetMetadata) {
    return {
      profile_key: profileKey,
      display_name: presetMetadata[profileKey] || profileKey,
      expertise: presetFactors[profileKey].expertise,
      aicapability: presetFactors[profileKey].aicapability,
      governance: presetFactors[profileKey].governance
    };
  }
  
  /**
   * Transform frontend scenario data to database format
   */
  function frontendScenarioToDb(profileKey, scenarioKey, scenarioFactors, scenarioMetadata) {
    const compositeKey = `${profileKey}:${scenarioKey}`;
    
    return {
      scenario_key: scenarioKey,
      display_name: scenarioMetadata[profileKey]?.[scenarioKey] || scenarioKey,
      importance: scenarioFactors[compositeKey].importance,
      complexity: scenarioFactors[compositeKey].complexity,
      maturity: scenarioFactors[compositeKey].maturity
    };
  }
  
  /**
   * Transform frontend workflow to database format
   * @param {string} profileKey - The profile key
   * @param {string} scenarioKey - The scenario key
   * @param {Array} workflowArray - Array of [roleName, focusName] pairs
   * @returns {Array} Array of {dev_approach_slug, partner_approach_slug} objects
   */
  function frontendWorkflowToDb(profileKey, scenarioKey, workflowArray) {
    // Get vocabularies from global cache
    const vocabularies = window.cachedVocabularies || { dev_approaches: [], partner_approaches: [] };
    
    return workflowArray.map((step, index) => {
      const [roleName, focusName] = step;
      
      // Find slugs from names
      const devApproach = vocabularies.dev_approaches.find(
        da => da.name === roleName
      );
      const partnerApproach = vocabularies.partner_approaches.find(
        pa => pa.name === focusName
      );
      
      return {
        dev_approach_slug: devApproach ? devApproach.slug : roleName.toLowerCase().replace(/\s+/g, '-'),
        partner_approach_slug: partnerApproach ? partnerApproach.slug : focusName.toLowerCase().replace(/\s+/g, '-')
      };
    });
  }
  
  /**
   * Transform frontend product to database format
   * @param {string} productKey - The product key
   * @param {string} displayName - The product display name
   * @param {Array} capabilitiesArray - Array of [roleName, focusName] pairs
   * @returns {Object} Product data in database format
   */
  function frontendProductToDb(productKey, displayName, capabilitiesArray) {
    // Get vocabularies from global cache
    const vocabularies = window.cachedVocabularies || { dev_approaches: [], partner_approaches: [] };
    
    const capabilities = capabilitiesArray.map((cap, index) => {
      const [roleName, focusName] = cap;
      
      // Find slugs from names
      const devApproach = vocabularies.dev_approaches.find(
        da => da.name === roleName
      );
      const partnerApproach = vocabularies.partner_approaches.find(
        pa => pa.name === focusName
      );
      
      return {
        dev_approach_slug: devApproach ? devApproach.slug : roleName.toLowerCase().replace(/\s+/g, '-'),
        partner_approach_slug: partnerApproach ? partnerApproach.slug : focusName.toLowerCase().replace(/\s+/g, '-')
      };
    });
    
    return {
      product_key: productKey,
      display_name: displayName,
      capabilities: capabilities
    };
  }
  
  // Public API
  return {
    dbProfilesToFrontend,
    dbScenariosToFrontend,
    dbWorkflowStepsToFrontend,
    dbProductsToFrontend,
    frontendProfileToDb,
    frontendScenarioToDb,
    frontendWorkflowToDb,
    frontendProductToDb
  };
})();

// Make DataTransform available globally
window.DataTransform = DataTransform;
