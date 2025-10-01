/**
 * Data Storage Module
 * Handles export/import of scenario data to/from a JSON file
 * This allows persistence of user changes across sessions and devices
 */

const DataStorage = (function() {
  const STORAGE_FILE_NAME = 'ux-table-data.json';
  const AUTO_SAVE_KEY = 'uxTableAutoSaveEnabled';
  
  /**
   * Export all current data to a JSON file
   */
  function exportToFile() {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      productCapabilities: productCapabilities,
      productMetadata: productMetadata,
      presets: presets,
      presetFactors: presetFactors,
      presetMetadata: presetMetadata,
      workflows: workflows,
      scenarioFactors: scenarioFactors,
      scenarioMetadata: scenarioMetadata
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = STORAGE_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  }
  
  /**
   * Import data from a JSON file
   */
  function importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate data structure
          if (!validateImportData(data)) {
            reject(new Error('Invalid file format. Please select a valid UX Table data file.'));
            return;
          }
          
          // Import the data
          if (data.productCapabilities) {
            Object.assign(productCapabilities, data.productCapabilities);
          }
          if (data.productMetadata) {
            Object.assign(productMetadata, data.productMetadata);
          }
          if (data.presets) {
            Object.assign(presets, data.presets);
          }
          if (data.presetFactors) {
            Object.assign(presetFactors, data.presetFactors);
          }
          if (data.presetMetadata) {
            Object.assign(presetMetadata, data.presetMetadata);
          }
          if (data.workflows) {
            Object.assign(workflows, data.workflows);
          }
          if (data.scenarioFactors) {
            Object.assign(scenarioFactors, data.scenarioFactors);
          }
          if (data.scenarioMetadata) {
            Object.assign(scenarioMetadata, data.scenarioMetadata);
          }
          
          // Save to localStorage
          saveProductCapabilities();
          savePresets();
          saveWorkflows();
          
          // Reinitialize UI
          initializeProductUI();
          initializePresetUI();
          initializeScenarioUI();
          
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse file: ' + error.message));
        }
      };
      
      reader.onerror = function() {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Validate imported data structure
   */
  function validateImportData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for at least one expected property
    const expectedProps = [
      'productCapabilities',
      'productMetadata',
      'presets',
      'presetFactors',
      'presetMetadata',
      'workflows',
      'scenarioFactors',
      'scenarioMetadata'
    ];
    
    return expectedProps.some(prop => data.hasOwnProperty(prop));
  }
  
  /**
   * Auto-save current data to localStorage
   * This is called automatically when data changes
   */
  function autoSave() {
    const autoSaveEnabled = getAutoSaveEnabled();
    if (!autoSaveEnabled) {
      return;
    }
    
    try {
      // Data is already saved to localStorage by existing functions
      // This function just provides a hook for additional functionality
      console.log('Auto-save triggered at', new Date().toISOString());
      
      // Optionally, trigger export to file
      const autoExportEnabled = localStorage.getItem('uxTableAutoExport') === 'true';
      if (autoExportEnabled) {
        exportToFile();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
  
  /**
   * Load data from a default file if available
   */
  function loadFromDefaultFile() {
    // Check if there's a default file to load
    const defaultFileInput = document.getElementById('defaultDataFile');
    if (defaultFileInput && defaultFileInput.files.length > 0) {
      return importFromFile(defaultFileInput.files[0]);
    }
    return Promise.resolve(null);
  }
  
  /**
   * Get/Set auto-save preference
   */
  function getAutoSaveEnabled() {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    return stored === null ? true : stored === 'true';
  }
  
  function setAutoSaveEnabled(enabled) {
    localStorage.setItem(AUTO_SAVE_KEY, enabled ? 'true' : 'false');
  }
  
  /**
   * Create a backup of current data in localStorage
   */
  function createBackup() {
    const backupKey = 'uxTableBackup_' + Date.now();
    const data = {
      productCapabilities: productCapabilities,
      productMetadata: productMetadata,
      presets: presets,
      presetFactors: presetFactors,
      presetMetadata: presetMetadata,
      workflows: workflows,
      scenarioFactors: scenarioFactors,
      scenarioMetadata: scenarioMetadata
    };
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      // Clean up old backups (keep only last 5)
      cleanupOldBackups();
      
      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }
  
  /**
   * Restore from a backup
   */
  function restoreFromBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const data = JSON.parse(backupData);
      
      // Restore the data
      Object.assign(productCapabilities, data.productCapabilities || {});
      Object.assign(productMetadata, data.productMetadata || {});
      Object.assign(presets, data.presets || {});
      Object.assign(presetFactors, data.presetFactors || {});
      Object.assign(presetMetadata, data.presetMetadata || {});
      Object.assign(workflows, data.workflows || {});
      Object.assign(scenarioFactors, data.scenarioFactors || {});
      Object.assign(scenarioMetadata, data.scenarioMetadata || {});
      
      // Save to current localStorage
      saveProductCapabilities();
      savePresets();
      saveWorkflows();
      
      // Reinitialize UI
      initializeProductUI();
      initializePresetUI();
      initializeScenarioUI();
      
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }
  
  /**
   * Clean up old backups (keep only last 5)
   */
  function cleanupOldBackups() {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('uxTableBackup_')) {
        backupKeys.push(key);
      }
    }
    
    // Sort by timestamp (newest first)
    backupKeys.sort().reverse();
    
    // Remove old backups (keep only 5)
    for (let i = 5; i < backupKeys.length; i++) {
      localStorage.removeItem(backupKeys[i]);
    }
  }
  
  /**
   * List available backups
   */
  function listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('uxTableBackup_')) {
        const timestamp = parseInt(key.replace('uxTableBackup_', ''));
        backups.push({
          key: key,
          timestamp: timestamp,
          date: new Date(timestamp).toLocaleString()
        });
      }
    }
    
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  // Public API
  return {
    exportToFile: exportToFile,
    importFromFile: importFromFile,
    autoSave: autoSave,
    loadFromDefaultFile: loadFromDefaultFile,
    getAutoSaveEnabled: getAutoSaveEnabled,
    setAutoSaveEnabled: setAutoSaveEnabled,
    createBackup: createBackup,
    restoreFromBackup: restoreFromBackup,
    listBackups: listBackups
  };
})();

// Make DataStorage available globally
window.DataStorage = DataStorage;
