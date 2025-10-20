# Restart Backend and Test Session 0

**Critical**: The backend must be restarted to pick up the Session 0 interview changes!

---

## STEP 1: Restart Backend

```bash
cd /srv/nuaibria/backend

# Stop current server if running (Ctrl+C)

# Rebuild
npm run build

# Start fresh
npm run dev
```

---

## STEP 2: Test Session 0 Interview

**Create a NEW Bard character** (existing ones have old state)

### Expected Flow:

```
1. Create character
   → Should see: "Welcome! This is your Session 0..."

2. Say: "ready" or "let's start"
   → Should see: Class introduction (Bard explanation)

3. Say: "continue"
   → Should see: Cantrip selection prompt with list

4. Say: "I choose Vicious Mockery and Mage Hand"
   → Should see: "Cantrips selected! Now choose spells..."

5. Say: "Healing Word, Charm Person, Dissonant Whispers, Faerie Fire"
   → Should see: "Equipment choice..."

6. Say: "rapier"
   → Should see: "Backstory questions..." (or skip to review)

7. Say: "skip backstory" or answer questions
   → Should see: CHARACTER REVIEW with all choices

8. Say: "I'm ready to enter the world"
   → Should see: Level 0→1, "Welcome to Nuaibria at (500,500)!"
   → NOW in world, can explore
```

---

## STEP 3: Test Skip Functionality

```
1. Create new Wizard
2. Say: "skip"
   → Should: Auto-assign default spells
   → Jump to: interview_complete with review
3. Say: "enter world"
   → Should: Immediate world entry
```

---

## What Should Happen Now:

With backend restarted:
- ✅ Session 0 interview works
- ✅ No desert/world narrative during interview
- ✅ The Chronicler stays in "teaching mode"
- ✅ Spell selection guided properly
- ✅ Character review before world entry

---

**RESTART THE BACKEND** then test - it should work perfectly!
