# UX Refactoring Plan - Edit Mode Redesign

## Overview
Complete redesign of edit mode UX to eliminate dropdown confusion and implement direct selection with auto-save.

## HTML Changes (✅ COMPLETED)

### Profile Presets Section
- ✅ Replace "Edit" button with pencil icon (✏️)
- ✅ Remove dropdown `#editPresetSelect`
- ✅ Add "+" button to preset row (will be added dynamically in JS)
- ✅ Reorganize buttons below: Exit, Rename, Delete
- ✅ Update edit info text

### Scenarios Section  
- ✅ Remove "Edit" button completely
- ✅ Remove dropdown `#editScenarioSelect`
- ✅ Add "+" button to scenario row (will be added dynamically in JS)
- ✅ Show Rename, Delete buttons only in edit mode
- ✅ Update edit info text

### Product Capabilities Section
- ✅ Replace "Edit" button with pencil icon (✏️)
- ✅ Remove dropdown `#editProductSelect`
- ✅ Add "+" button to product row (will be added dynamically in JS)
- ✅ Reorganize buttons below: Exit, Rename, Delete
- ✅ Update edit info text

## CSS Changes (✅ COMPLETED)
- ✅ `.edit-icon-btn` - Style for pencil icon
- ✅ `.add-btn` - Style for + button
- ✅ `.preset-btn.edit-mode-active` - Visual feedback in edit mode
- ✅ `.preset-btn.disabled` - Disabled state styling

## JavaScript Changes (TODO)

### 1. Profile Preset Edit Mode

#### Variables
```javascript
let presetEditMode = false;
let currentEditingPreset = null;  // Track which preset is being edited
```

#### Enter Edit Mode
```javascript
function enterPresetEditMode() {
  presetEditMode = false;
  
  // Show edit controls
  document.getElementById('presetEditControls').style.display = 'block';
  
  // Add active class to pencil icon
  document.getElementById('presetEditToggle').classList.add('active');
  
  // Add "+" button to preset row
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.id = 'addPresetBtn';
  addBtn.textContent = '+';
  addBtn.title = 'Create a new profile preset';
  document.getElementById('presetButtonsContainer').appendChild(addBtn);
  
  // Enable factor sliders
  enableFactorSliders('preset');
  
  // Make scenarios editable
  enableScenarioEditing();
}
```

#### Exit Edit Mode with Auto-save
```javascript
async function exitPresetEditMode() {
  // Auto-save current preset if one is selected
  if (currentPreset && presetFactors[currentPreset]) {
    await savePresetToDatabase(currentPreset);
  }
  
  // Auto-save current scenario if one is selected
  if (currentPreset && currentScenario) {
    await saveScenarioToDatabase(currentPreset, currentScenario);
  }
  
  presetEditMode = false;
  
  // Hide edit controls
  document.getElementById('presetEditControls').style.display = 'none';
  
  // Remove active class from pencil icon
  document.getElementById('presetEditToggle').classList.remove('active');
  
  // Remove "+" button
  document.getElementById('addPresetBtn')?.remove();
  
  // Disable factor sliders
  disableFactorSliders('preset');
  
  // Disable scenario editing
  disableScenarioEditing();
}
```

#### Preset Button Click Handler (Modified)
```javascript
presetBtn.addEventListener('click', async () => {
  if (presetEditMode) {
    // In edit mode: Auto-save previous preset, switch to new preset
    if (currentPreset && currentPreset !== presetKey) {
      await savePresetToDatabase(currentPreset);
      
      // Also save scenario if one was selected
      if (currentScenario) {
        await saveScenarioToDatabase(currentPreset, currentScenario);
      }
    }
  }
  
  // Switch to new preset
  currentPreset = presetKey;
  updateFactorSliders(presetKey);
  initializeScenarioUI(true);
  
  // Update active state
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  presetBtn.classList.add('active');
});
```

### 2. Scenario Editing (No Separate Edit Mode)

#### Enable/Disable Scenario Editing
```javascript
function enableScenarioEditing() {
  // Show scenario edit controls
  document.getElementById('scenarioEditControls').style.display = 'block';
  
  // Add "+" button to scenario row
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.id = 'addScenarioBtn';
  addBtn.textContent = '+';
  addBtn.title = 'Create a new scenario';
  document.getElementById('scenarioButtonsContainer').appendChild(addBtn);
  
  // Enable factor sliders
  enableFactorSliders('scenario');
  
  // Make table cells clickable for workflow
  enableWorkflowEditing();
}

function disableScenarioEditing() {
  document.getElementById('scenarioEditControls').style.display = 'none';
  document.getElementById('addScenarioBtn')?.remove();
  disableFactorSliders('scenario');
  disableWorkflowEditing();
}
```

#### Scenario Button Click Handler (Modified)
```javascript
scenarioBtn.addEventListener('click', async () => {
  if (presetEditMode) {
    // In edit mode: Auto-save previous scenario, switch to new scenario
    if (currentScenario && currentScenario !== scenarioKey) {
      await saveScenarioToDatabase(currentPreset, currentScenario);
    }
  }
  
  // Switch to new scenario
  currentScenario = scenarioKey;
  updateScenarioFactorSliders(currentPreset, scenarioKey);
  loadWorkflowPath(currentPreset, scenarioKey);
  
  // Update active state
  document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
  scenarioBtn.classList.add('active');
});
```

### 3. Product Capabilities Edit Mode (Similar to Presets)

#### Enter/Exit Product Edit Mode
```javascript
function enterProductEditMode() {
  productEditMode = true;
  
  document.getElementById('productEditControls').style.display = 'block';
  document.getElementById('editModeToggle').classList.add('active');
  
  // Add "+" button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.id = 'addProductBtn';
  addBtn.textContent = '+';
  addBtn.title = 'Create a new product';
  document.getElementById('productButtonsContainer').appendChild(addBtn);
  
  // Make table cells clickable
  enableProductEditing();
}

async function exitProductEditMode() {
  // Auto-save current product if one is selected
  if (selectedProduct && productCapabilities[selectedProduct]) {
    await saveProductToDatabase(selectedProduct);
  }
  
  productEditMode = false;
  
  document.getElementById('productEditControls').style.display = 'none';
  document.getElementById('editModeToggle').classList.remove('active');
  document.getElementById('addProductBtn')?.remove();
  
  disableProductEditing();
}
```

### 4. Auto-save Functions

```javascript
async function savePresetToDatabase(presetKey) {
  try {
    const profileData = DataTransform.frontendProfileToDb(presetKey, presetFactors, presetMetadata);
    await API.updateProfile(presetKey, profileData);
    console.log(`Preset ${presetKey} saved to database`);
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
}

async function saveScenarioToDatabase(profileKey, scenarioKey) {
  try {
    // Save scenario factors
    const compositeKey = `${profileKey}:${scenarioKey}`;
    if (scenarioFactors[compositeKey]) {
      const scenarioData = DataTransform.frontendScenarioToDb(profileKey, scenarioKey, scenarioFactors, scenarioMetadata);
      await API.updateScenario(profileKey, scenarioKey, scenarioData);
    }
    
    // Save workflow steps
    if (workflows[compositeKey]) {
      const workflowSteps = DataTransform.frontendWorkflowToDb(profileKey, scenarioKey, workflows[compositeKey]);
      await API.saveWorkflowSteps(profileKey, scenarioKey, workflowSteps);
    }
    
    console.log(`Scenario ${profileKey}:${scenarioKey} saved to database`);
  } catch (error) {
    console.error('Failed to save scenario:', error);
  }
}

async function saveProductToDatabase(productKey) {
  try {
    const productData = DataTransform.frontendProductToDb(productKey, productMetadata[productKey], productCapabilities[productKey] || []);
    await API.updateProduct(productKey, productData);
    console.log(`Product ${productKey} saved to database`);
  } catch (error) {
    console.error('Failed to save product:', error);
  }
}
```

### 5. Delete Confirmations with Cascade Warnings

```javascript
// Delete Preset with Cascade Warning
async function deletePreset(presetKey) {
  const presetName = presetMetadata[presetKey];
  const scenarioCount = Object.keys(scenarioMetadata[presetKey] || {}).length;
  
  const message = `Are you sure you want to delete "${presetName}"?\n\n` +
                  `This will permanently delete:\n` +
                  `- The profile preset\n` +
                  `- ${scenarioCount} scenario(s)\n` +
                  `- All associated workflow paths\n\n` +
                  `This action cannot be undone.`;
  
  if (confirm(message)) {
    try {
      await API.deleteProfile(presetKey);
      delete presets[presetKey];
      delete presetFactors[presetKey];
      delete presetMetadata[presetKey];
      // Clean up scenarios too
      delete scenarioMetadata[presetKey];
      initializePresetUI();
    } catch (error) {
      console.error('Failed to delete preset:', error);
      alert('Failed to delete preset. Please try again.');
    }
  }
}

// Similar for deleteScenario and deleteProduct
```

## Implementation Order

1. ✅ HTML structure changes
2. ✅ CSS styling
3. ⏳ JavaScript refactoring:
   - Update initializePresetUI (remove dropdown logic, add + button logic)
   - Implement enterPresetEditMode / exitPresetEditMode
   - Update preset button click handlers with auto-save
   - Update initializeScenarioUI (remove Edit button, integrate with preset edit mode)
   - Update scenario button click handlers with auto-save
   - Implement enterProductEditMode / exitProductEditMode
   - Update product button click handlers with auto-save
   - Add auto-save functions
   - Update delete confirmations with cascade warnings
4. ⏳ Create seed-database.sql
5. ⏳ Testing

## Status: IN PROGRESS (Step 3 - JavaScript Refactoring)
