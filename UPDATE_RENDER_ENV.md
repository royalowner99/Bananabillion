# ⚡ Update Render Environment Variables

## 🎯 Action Required

You need to update 3 environment variables on Render for the new game balance:

## 📝 Variables to Update

Go to: https://dashboard.render.com → bananabillion-backend → Environment

### Change These 3 Variables:

**1. BASE_MAX_ENERGY**
- Old value: `1000`
- New value: `500`

**2. BASE_ENERGY_REGEN**
- Old value: `1`
- New value: `0.5`

**3. MAX_TAPS_PER_SECOND**
- Old value: `15`
- New value: `10`

## 🚀 Quick Steps

1. Go to Render dashboard
2. Click **bananabillion-backend**
3. Click **Environment** tab
4. Find each variable and click "Edit"
5. Change the value
6. Click **Save Changes**
7. Wait 2-3 minutes for redeploy

## ✅ What This Does

### Slower Energy Regeneration
- Energy now regenerates 10x slower
- Users need to wait longer between sessions
- Makes the game more engaging
- Encourages users to come back regularly

### Lower Starting Energy
- Users start with 500 instead of 1000
- Makes upgrades more valuable
- Better progression curve
- More strategic gameplay

### Lower Tap Rate
- Prevents spam tapping
- More realistic gameplay
- Prevents auto-clicker abuse

## 🧪 Test After Update

1. Open mini app in Telegram
2. Tap banana until energy is low
3. Watch energy bar - should regenerate slowly (0.5 per second)
4. Try completing a task with a link
5. Should show confirmation dialog

## 📊 Expected Behavior

**Energy:**
- Starts at 500/500
- Decreases by 1 per tap
- Regenerates 0.5 per second
- Takes ~16 minutes to fully regenerate from 0

**Tasks:**
- Opens link when clicked
- Waits 2 seconds
- Shows "Did you complete the task?" dialog
- Only gives reward if user confirms

**Tapping:**
- Max 10 taps per second
- Smooth and responsive
- No lag or spam

## 🎮 User Experience

**Before:**
- Energy regenerated too fast
- Users could play indefinitely
- No incentive to upgrade
- Tasks completed instantly

**After:**
- Energy is a valuable resource
- Users manage energy strategically
- Upgrades feel impactful
- Tasks require actual completion

## 📞 If Issues Occur

### Energy still regenerates fast?
- Check if BASE_ENERGY_REGEN is set to `0.5`
- Clear browser cache
- Restart mini app

### Tasks don't show confirmation?
- Check browser console for errors
- Make sure code is deployed
- Verify task has a link

### Max energy still 1000?
- Check if BASE_MAX_ENERGY is set to `500`
- Redeploy service
- Create new user to test

---

**Status:** Code deployed, waiting for environment variable update
**Time needed:** 2 minutes
**Impact:** Much better game balance and engagement! 🎉
