# 🔧 Equipment Debugging Guide

## Issue
Lab equipment not working - need to verify the flow.

## Debugging Added

I've added console logging at key points to trace the equipment flow:

### 1. Equipment Panel Toggle
**Location:** `components/EquipmentPanel.tsx`
```
EquipmentPanel: Equipment toggled {
  id: "hot-plate",
  updated: [...active equipment...],
  hasCallback: true/false
}
```

### 2. Lab Equipment State Change
**Location:** `app/lab/page.tsx`
```
Lab: Active equipment changed {
  count: 2,
  active: [...],
  all: [...]
}
```

### 3. Reaction with Equipment
**Location:** `app/lab/page.tsx`
```
Lab: Performing reaction with equipment {
  totalEquipment: 8,
  activeCount: 2,
  activeEquipment: [...]
}

Lab: Experiment with equipment {
  chemicals: [...],
  equipment: [...]
}
```

---

## How to Debug

### Step 1: Open Browser Console
1. Press F12
2. Go to Console tab
3. Clear console

### Step 2: Turn On Equipment
1. Go to `/lab`
2. Click floating "Quick Actions" button (flame icon)
3. Click "Lab Equipment"
4. Turn on "Hot Plate"
5. Set temperature to 100°C

**Expected Console Output:**
```
EquipmentPanel: Equipment toggled {
  id: "hot-plate",
  updated: [{ id: "hot-plate", name: "Hot Plate", active: true, value: 100, ... }],
  hasCallback: true
}

Lab: Active equipment changed {
  count: 8,
  active: [{ id: "hot-plate", name: "Hot Plate", active: true, ... }],
  all: [8 equipment items]
}
```

### Step 3: Perform Reaction
1. Add chemicals to test tube (e.g., NaCl + AgNO₃)
2. Click "Perform Reaction"

**Expected Console Output:**
```
Lab: Performing reaction with equipment {
  totalEquipment: 8,
  activeCount: 1,
  activeEquipment: [{ name: "Hot Plate", value: 100, unit: "°C" }]
}

Lab: Experiment with equipment {
  chemicals: [...],
  equipment: [{ name: "Hot Plate", value: 100, unit: "°C" }]
}
```

### Step 4: Check Reaction Results
Look for "Active Lab Equipment" section at top of results panel.

---

## Common Issues

### Issue 1: "hasCallback: false"
**Problem:** Equipment panel not connected to lab page
**Solution:** Check that `onEquipmentChange={setActiveEquipment}` is set

### Issue 2: "activeCount: 0" when equipment is on
**Problem:** Equipment state not updating
**Solution:** Check equipment toggle function

### Issue 3: Equipment not in reaction results
**Problem:** Equipment not being sent to API
**Solution:** Check experiment object being sent to `/api/react`

### Issue 4: Equipment shown but not affecting AI
**Problem:** Backend not considering equipment
**Solution:** Check backend prompt includes equipment info

---

## Expected Flow

```
1. User clicks "Turn On" on Hot Plate
   ↓
2. EquipmentPanel.toggleEquipment() called
   ↓
3. Equipment state updated (active: true)
   ↓
4. onEquipmentChange(updated) called
   ↓
5. Lab page setActiveEquipment(updated)
   ↓
6. activeEquipment state updated
   ↓
7. User clicks "Perform Reaction"
   ↓
8. handleReaction() filters active equipment
   ↓
9. Adds equipment to experiment object
   ↓
10. Sends to /api/react
    ↓
11. API sends to Ollama backend
    ↓
12. Backend includes equipment in prompt
    ↓
13. Ollama considers equipment in analysis
    ↓
14. Results show equipment effects
```

---

## Verification Checklist

- [ ] Open browser console
- [ ] Go to `/lab`
- [ ] Open equipment panel
- [ ] Turn on Hot Plate
- [ ] See "EquipmentPanel: Equipment toggled" message
- [ ] See "Lab: Active equipment changed" message
- [ ] Add chemicals to test tube
- [ ] Click "Perform Reaction"
- [ ] See "Lab: Performing reaction with equipment" message
- [ ] See equipment count > 0
- [ ] See "Active Lab Equipment" section in results
- [ ] Equipment settings displayed correctly

---

## What Should Happen

### When Equipment is Active
1. **Visual Feedback:**
   - Icon pulses
   - "ON" badge appears
   - Green glowing border
   - Status shows "⚡ Active"

2. **In Reaction Results:**
   - "Active Lab Equipment" section at top
   - Shows equipment name and settings
   - Orange gradient box
   - "⚡ Equipment settings are affecting this reaction" message

3. **In AI Analysis:**
   - AI considers equipment in analysis
   - Results mention temperature/stirring/etc.
   - Observations reflect equipment effects

---

## Test Scenarios

### Test 1: Hot Plate
1. Turn on Hot Plate (100°C)
2. Add HCl + NaOH
3. React
4. **Expected:** AI mentions "heated reaction" or "temperature increase"

### Test 2: Magnetic Stirrer
1. Turn on Magnetic Stirrer (500 RPM)
2. Add AgNO₃ + NaCl
3. React
4. **Expected:** AI mentions "well-mixed" or "uniform mixing"

### Test 3: Multiple Equipment
1. Turn on Hot Plate (100°C)
2. Turn on Magnetic Stirrer (300 RPM)
3. Add chemicals
4. React
5. **Expected:** Both equipment shown in results

---

## Files Modified

1. ✅ `components/EquipmentPanel.tsx` - Added toggle logging
2. ✅ `app/lab/page.tsx` - Added state change logging
3. ✅ `app/lab/page.tsx` - Added reaction logging

---

## Next Steps

1. **Run the app**
2. **Open console**
3. **Follow the test steps**
4. **Check console output**
5. **Report what you see**

If you see all the console messages, the equipment system is working!

---

**Status:** 🔍 **DEBUGGING ENABLED**

Check your browser console to see what's happening!
