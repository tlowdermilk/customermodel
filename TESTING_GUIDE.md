# Testing Guide

## Quick Test Checklist

Use this checklist to verify the data persistence features are working correctly.

## Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- `index.html` and `data-storage.js` in the same directory
- No browser extensions blocking localStorage or downloads

## Test Suite

### ✅ Test 1: Initial Load

**Steps:**
1. Open `index.html` in browser
2. Observe the Data Management section at the top

**Expected Results:**
- ✓ Application loads without errors
- ✓ Data Management section visible
- ✓ Four buttons present: Export Data, Import Data, Create Backup, Restore Backup
- ✓ Status message area present (empty initially)
- ✓ Default presets and scenarios loaded

**Pass/Fail:** ____

---

### ✅ Test 2: Export Functionality

**Steps:**
1. Click "Export Data" button
2. Check Downloads folder

**Expected Results:**
- ✓ Success message appears: "Data exported successfully!"
- ✓ File `ux-table-data.json` downloaded
- ✓ File opens in text editor showing JSON structure
- ✓ File contains version, timestamp, and data objects

**Pass/Fail:** ____

---

### ✅ Test 3: Import Validation

**Steps:**
1. Create a text file named `invalid.json` with content: `{ "invalid": true }`
2. Click "Import Data"
3. Select `invalid.json`

**Expected Results:**
- ✓ Error message appears
- ✓ Message indicates invalid file format
- ✓ Application state unchanged
- ✓ No data corruption

**Pass/Fail:** ____

---

### ✅ Test 4: Valid Import

**Steps:**
1. If you exported in Test 2, use that file OR use provided `ux-table-data.json`
2. Click "Import Data"
3. Select the JSON file

**Expected Results:**
- ✓ Success message appears: "Data imported successfully!"
- ✓ UI updates to show imported data
- ✓ Presets, scenarios, and workflows load correctly
- ✓ Factor sliders show correct values

**Pass/Fail:** ____

---

### ✅ Test 5: Backup Creation

**Steps:**
1. Click "Create Backup" button
2. Observe status message

**Expected Results:**
- ✓ Success message appears: "Backup created successfully!"
- ✓ No errors in browser console
- ✓ Message clears after 5 seconds

**Pass/Fail:** ____

---

### ✅ Test 6: Backup Restoration

**Steps:**
1. Click "Restore Backup" button
2. If backups exist, select option 1
3. Confirm restoration

**Expected Results:**
- ✓ Dialog shows list of available backups with timestamps
- ✓ Confirmation dialog appears
- ✓ Success message: "Backup restored successfully!"
- ✓ UI updates to restored state

**Pass/Fail:** ____

**If no backups exist:**
- ✓ Alert: "No backups available"
- ✓ No errors

**Pass/Fail:** ____

---

### ✅ Test 7: Data Modification and Export

**Steps:**
1. Select a Profile Preset (e.g., "Enterprise Maintainer")
2. Select a Scenario (e.g., "Prototyping")
3. Click "Edit" in Scenarios section
4. Click some cells to modify workflow
5. Adjust factor sliders
6. Click "Exit"
7. Click "Export Data"
8. Open exported file

**Expected Results:**
- ✓ Changes saved to localStorage
- ✓ Export includes modified data
- ✓ Workflow array contains selected cells
- ✓ Factor values reflect slider positions

**Pass/Fail:** ____

---

### ✅ Test 8: Import Overwrites Changes

**Steps:**
1. Make changes to a preset (as in Test 7)
2. Note the current state
3. Import a different data file (or the original `ux-table-data.json`)
4. Observe the UI

**Expected Results:**
- ✓ Backup created automatically before import
- ✓ UI updates to imported data
- ✓ Previous changes overwritten
- ✓ Can restore previous state via "Restore Backup"

**Pass/Fail:** ____

---

### ✅ Test 9: Browser Persistence

**Steps:**
1. Make some changes and exit edit mode
2. Close browser tab
3. Open `index.html` again

**Expected Results:**
- ✓ Changes persist after browser close
- ✓ Data loaded from localStorage
- ✓ UI shows previous state

**Pass/Fail:** ____

---

### ✅ Test 10: Cross-Browser Transfer

**Steps:**
1. In Browser A: Export data
2. In Browser B: Open `index.html`
3. In Browser B: Import the exported file

**Expected Results:**
- ✓ File imports successfully in Browser B
- ✓ All data appears correctly
- ✓ Same configuration in both browsers

**Pass/Fail:** ____

---

## Advanced Tests

### ✅ Test 11: Auto-Save Hook

**Steps:**
1. Open browser console (F12)
2. Make changes and exit edit mode
3. Watch console for messages

**Expected Results:**
- ✓ Console shows "Auto-save triggered" message
- ✓ Timestamp included in message
- ✓ No errors

**Pass/Fail:** ____

---

### ✅ Test 12: Multiple Backups

**Steps:**
1. Click "Create Backup" 6 times (wait 1 second between clicks)
2. Click "Restore Backup"
3. Count available backups

**Expected Results:**
- ✓ Only 5 most recent backups shown
- ✓ Oldest backup automatically removed
- ✓ Backups sorted newest first

**Pass/Fail:** ____

---

### ✅ Test 13: Large Data Set

**Steps:**
1. Create multiple presets (5+)
2. Create multiple scenarios for each preset (3+ each)
3. Define complex workflows with many cells
4. Export data
5. Check file size

**Expected Results:**
- ✓ Export completes without errors
- ✓ File size reasonable (typically < 100 KB)
- ✓ File structure valid JSON
- ✓ Can re-import successfully

**Pass/Fail:** ____

---

### ✅ Test 14: Empty State Import

**Steps:**
1. Clear browser localStorage (Dev Tools > Application > Clear Site Data)
2. Refresh page
3. Import a data file

**Expected Results:**
- ✓ Empty state loads with defaults
- ✓ Import works correctly
- ✓ All data populated from file

**Pass/Fail:** ____

---

### ✅ Test 15: Error Recovery

**Steps:**
1. Make significant changes
2. Try to import an invalid file
3. Verify data unchanged
4. Import a valid file
5. Verify data updated

**Expected Results:**
- ✓ Failed import doesn't corrupt data
- ✓ Current state preserved
- ✓ Subsequent valid import works
- ✓ Can still export current data

**Pass/Fail:** ____

---

## Browser-Specific Tests

### Chrome/Edge
- ✓ Downloads work
- ✓ File picker opens
- ✓ localStorage accessible
- ✓ Console messages visible

### Firefox
- ✓ Downloads work
- ✓ File picker opens
- ✓ localStorage accessible
- ✓ Console messages visible

### Safari
- ✓ Downloads work
- ✓ File picker opens
- ✓ localStorage accessible
- ✓ Console messages visible

---

## Performance Tests

### Speed Test: Export
**Steps:**
1. Note current time
2. Click "Export Data"
3. Note time when file downloads

**Expected:** < 1 second
**Actual:** ____

---

### Speed Test: Import
**Steps:**
1. Note current time
2. Click "Import Data" and select file
3. Note time when success message appears

**Expected:** < 2 seconds
**Actual:** ____

---

### Speed Test: Backup
**Steps:**
1. Note current time
2. Click "Create Backup"
3. Note time when success message appears

**Expected:** < 0.5 seconds
**Actual:** ____

---

## Edge Cases

### ✅ Test: Empty Workflows
**Steps:**
1. Create preset/scenario with no workflow cells
2. Export
3. Import

**Expected:**
- ✓ Exports with empty array
- ✓ Imports successfully
- ✓ No errors

**Pass/Fail:** ____

---

### ✅ Test: Special Characters
**Steps:**
1. Create preset with name: "Test & <Special> 'Characters'"
2. Export
3. Import

**Expected:**
- ✓ Name preserved correctly
- ✓ No encoding issues
- ✓ Displays correctly in UI

**Pass/Fail:** ____

---

### ✅ Test: Maximum Data
**Steps:**
1. Create 10 presets
2. Each with 10 scenarios
3. Each with 15-cell workflows
4. All factors set to different values
5. Export

**Expected:**
- ✓ Export succeeds
- ✓ File size < 500 KB
- ✓ Import works
- ✓ No data loss

**Pass/Fail:** ____

---

## Regression Tests

After any code changes, run:

1. ✓ All features still work
2. ✓ No console errors
3. ✓ localStorage still saves
4. ✓ Export produces valid JSON
5. ✓ Import loads correctly
6. ✓ Backups create and restore
7. ✓ UI updates properly
8. ✓ Status messages appear
9. ✓ Error handling works
10. ✓ Documentation still accurate

---

## Bug Report Template

If you find issues:

```
**Test Name:** [Test number and name]

**Browser:** [Chrome/Firefox/Safari + version]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Console Errors:**
[Copy any error messages]

**Screenshots:**
[If applicable]

**Data File:**
[Attach if relevant]
```

---

## Test Results Summary

**Date:** ____________

**Tester:** ____________

**Browser:** ____________

**Total Tests:** 15 core + advanced/edge cases

**Passed:** ____

**Failed:** ____

**Pass Rate:** _____%

**Critical Issues:** ____

**Notes:**
```
[Add any observations or issues here]
```

---

## Sign-Off

By completing this test suite, I verify that the data persistence features are:

- [ ] Functional
- [ ] Reliable
- [ ] User-friendly
- [ ] Production-ready

**Tester Signature:** ____________

**Date:** ____________

---

## Continuous Testing

For ongoing quality:

1. **Weekly:** Run core tests (1-10)
2. **Before release:** Run all tests
3. **After changes:** Run regression tests
4. **User reports:** Document and retest

## Automated Testing (Future)

Consider adding:
- Unit tests for data-storage.js functions
- Integration tests for UI interactions
- E2E tests with Selenium/Puppeteer
- Performance benchmarks
- Compatibility matrix testing
