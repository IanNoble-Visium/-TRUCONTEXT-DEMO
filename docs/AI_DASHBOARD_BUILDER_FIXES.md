# AI Dashboard Builder Critical Fixes

## Overview

Fixed two critical issues in the AI Dashboard Builder implementation that were preventing proper multi-card dashboard creation and causing React rendering errors.

## Issues Fixed

### Issue 1: Adding Another Card Overwrites Previous Cards ✅

**Problem**: When clicking "Add Another Card" in builder mode, the newly generated card replaced the existing cards instead of being appended to the `builderCards` array.

**Root Cause**: The `onCreate()` function used `setBuilderCards(mapped)` which replaced the entire array instead of appending to it.

**Location**: `components/DataViews/AIDashboardsView.tsx` lines 170-189

**Fix Applied**:
```typescript
// Before (lines 176-182):
// Enter builder mode with the first card
setBuilderMode(true)
setBuilderCards(mapped)
setApiKeyMissing(false)
onClose()

// After (lines 177-189):
// Check if we're already in builder mode (adding another card)
if (builderMode) {
  // Append new cards to existing builder cards
  setBuilderCards(prev => [...prev, ...mapped])
} else {
  // Enter builder mode with the first card
  setBuilderMode(true)
  setBuilderCards(mapped)
}

setApiKeyMissing(false)
onClose()
```

**Impact**:
- ✅ First card creation enters builder mode correctly
- ✅ Subsequent cards are appended to existing cards
- ✅ Multi-card dashboards can now be built properly
- ✅ All cards are preserved when adding new ones

---

### Issue 2: React Hooks Order Violation ✅

**Problem**: React error: "React has detected a change in the order of Hooks called by AIDashboardsView." Hook #36 appeared conditionally (`undefined` vs `useContext`).

**Root Cause**: The `useColorModeValue` hook was being called conditionally inside a `{prompt && (...)}` block at line 633, violating React's Rules of Hooks which require hooks to be called in the same order on every render.

**Location**: `components/DataViews/AIDashboardsView.tsx` lines 98-104 and 641

**Fix Applied**:

1. **Moved hook to top level** (lines 98-104):
```typescript
// Before:
const toast = useToast()

const bg = useColorModeValue('white', 'gray.800')
const subtle = useColorModeValue('gray.600', 'gray.300')
const border = useColorModeValue('gray.200', 'gray.700')

// After:
const toast = useToast()

// All useColorModeValue hooks must be at the top level (before any conditional logic)
const bg = useColorModeValue('white', 'gray.800')
const subtle = useColorModeValue('gray.600', 'gray.300')
const border = useColorModeValue('gray.200', 'gray.700')
const selectedPromptBg = useColorModeValue('blue.50', 'blue.900')
```

2. **Used pre-computed value** (line 641):
```typescript
// Before (line 633):
{prompt && (
  <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
    ...
  </Box>
)}

// After (line 641):
{prompt && (
  <Box p={3} bg={selectedPromptBg} borderRadius="md">
    ...
  </Box>
)}
```

**Impact**:
- ✅ All hooks are now called unconditionally at the top level
- ✅ React Hooks order is consistent across renders
- ✅ No more React warnings in console
- ✅ Component renders correctly when switching views

---

## React Rules of Hooks

**Key Principles**:
1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call hooks from React function components or custom hooks
3. **Call hooks in the same order** - Ensure hooks are called in the same order on every render

**Why This Matters**:
React relies on the order of hook calls to preserve state between renders. When hooks are called conditionally, the order can change, causing React to lose track of which state belongs to which hook.

**Common Violations**:
```typescript
// ❌ BAD: Hook inside conditional
if (condition) {
  const value = useColorModeValue('light', 'dark')
}

// ❌ BAD: Hook inside JSX conditional
{condition && <Box bg={useColorModeValue('light', 'dark')} />}

// ✅ GOOD: Hook at top level, value used conditionally
const bgColor = useColorModeValue('light', 'dark')
{condition && <Box bg={bgColor} />}
```

---

## Testing Instructions

### Test 1: Multi-Card Dashboard Creation

1. **Navigate to AI Dashboards view**:
   - Open application at `http://localhost:3000`
   - Switch to "AI Dashboards" view

2. **Create first card**:
   - Click "Create with AI"
   - Select a suggested prompt (e.g., "Show vulnerability severity distribution")
   - Choose visualization type (e.g., "Bar Chart")
   - Click "Create"
   - **Expected**: Builder mode activates with blue banner

3. **Add second card**:
   - Click "Add Another Card" in the blue banner
   - Select a different prompt (e.g., "Show machines with most vulnerabilities")
   - Choose different visualization type (e.g., "Pie Chart")
   - Click "Create"
   - **Expected**: Both cards appear in the builder (not just the second one)

4. **Add third card** (optional):
   - Click "Add Another Card" again
   - Select another prompt
   - Choose "Mini Topology" visualization
   - Click "Create"
   - **Expected**: All three cards appear in the builder

5. **Verify card management**:
   - Reorder cards using up/down arrows
   - Edit card titles
   - Change visualization types
   - Remove a card
   - **Expected**: All operations work correctly

6. **Save dashboard**:
   - Click "Save Dashboard"
   - Enter dashboard name
   - Click "Save"
   - **Expected**: Dashboard saved with all cards

### Test 2: React Hooks Warning

1. **Open browser console**:
   - Press F12 to open DevTools
   - Switch to Console tab
   - Clear console

2. **Switch to AI Dashboards view**:
   - Navigate from Executive Dashboard to AI Dashboards
   - **Expected**: No React Hooks warning in console

3. **Switch back and forth**:
   - Switch between different views multiple times
   - **Expected**: No React Hooks warnings

4. **Create dashboard with prompt**:
   - Type a custom prompt
   - Select visualization type
   - Click "Create"
   - **Expected**: No React Hooks warnings

### Test 3: Builder Mode Workflow

1. **Create multi-card dashboard**:
   - Create first card → Builder mode activates
   - Add second card → Both cards visible
   - Add third card → All three cards visible

2. **Customize cards**:
   - Edit titles for each card
   - Change visualization types
   - Reorder cards

3. **Save and reload**:
   - Save dashboard with custom name
   - Click "Load" button
   - Select saved dashboard
   - **Expected**: All cards restored correctly

---

## Files Modified

1. **components/DataViews/AIDashboardsView.tsx**:
   - Lines 98-104: Added `selectedPromptBg` hook at top level
   - Lines 177-189: Fixed `onCreate()` to append cards in builder mode
   - Line 641: Used pre-computed `selectedPromptBg` instead of conditional hook

---

## Technical Details

### Builder Mode State Flow

```
Initial State:
  builderMode = false
  builderCards = []

User clicks "Create" (first card):
  onCreate() executes
  builderMode = false (condition)
  → setBuilderMode(true)
  → setBuilderCards([card1])
  
User clicks "Add Another Card":
  Modal reopens
  User selects prompt and creates
  onCreate() executes
  builderMode = true (condition)
  → setBuilderCards(prev => [...prev, card2])
  → builderCards = [card1, card2]

User clicks "Add Another Card" again:
  onCreate() executes
  builderMode = true (condition)
  → setBuilderCards(prev => [...prev, card3])
  → builderCards = [card1, card2, card3]

User clicks "Save Dashboard":
  saveDashboardFromBuilder() executes
  → Saves all cards to database
  → Exits builder mode
```

### Hook Call Order

**Before Fix**:
```
Render 1 (no prompt):
  1. useToast()
  2. useColorModeValue() // bg
  3. useColorModeValue() // subtle
  4. useColorModeValue() // border
  // No hook #4 because prompt is empty

Render 2 (with prompt):
  1. useToast()
  2. useColorModeValue() // bg
  3. useColorModeValue() // subtle
  4. useColorModeValue() // border
  5. useColorModeValue() // selectedPromptBg (inside conditional)
  // ❌ Hook order changed!
```

**After Fix**:
```
Render 1 (no prompt):
  1. useToast()
  2. useColorModeValue() // bg
  3. useColorModeValue() // subtle
  4. useColorModeValue() // border
  5. useColorModeValue() // selectedPromptBg
  // Value computed but not used

Render 2 (with prompt):
  1. useToast()
  2. useColorModeValue() // bg
  3. useColorModeValue() // subtle
  4. useColorModeValue() // border
  5. useColorModeValue() // selectedPromptBg
  // ✅ Same hook order, value used in JSX
```

---

## Verification

### Before Fixes:
- ❌ Adding second card replaced first card
- ❌ Multi-card dashboards impossible to create
- ❌ React Hooks warning in console
- ❌ Potential state corruption when switching views

### After Fixes:
- ✅ Adding cards appends to existing cards
- ✅ Multi-card dashboards work correctly
- ✅ No React Hooks warnings
- ✅ Consistent rendering across view switches

---

## Related Documentation

- [AI Dashboard Builder Enhancements](./AI_DASHBOARD_BUILDER_ENHANCEMENTS.md)
- [AI Dashboard Neo4j Serialization Fix](./AI_DASHBOARD_NEO4J_SERIALIZATION_FIX.md)
- [React Rules of Hooks](https://reactjs.org/link/rules-of-hooks)

---

## Conclusion

Both critical issues have been resolved:

1. **Multi-card builder** now correctly accumulates cards instead of replacing them
2. **React Hooks** are called consistently at the top level, eliminating warnings

The AI Dashboard Builder is now fully functional for creating sophisticated multi-card dashboards with mixed visualization types.

