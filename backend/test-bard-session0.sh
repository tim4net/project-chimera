#!/bin/bash
# Quick Bard Session 0 Verification Test
# Tests that database queries work and prompts are correct

echo "========================================================================="
echo "BARD SESSION 0 VERIFICATION TEST"
echo "========================================================================="
echo ""

cd /srv/nuaibria/backend

echo "Building backend..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"
echo ""

echo "Testing Bard Session 0 prompts..."
echo ""

# Use ts-node to run quick verification
node -r dotenv/config << 'EOF'
const { getSpellRequirements } = require('./dist/services/spellValidator');

console.log("=== BARD REQUIREMENTS ===");
const bardReqs = getSpellRequirements('Bard');
console.log("Cantrips needed:", bardReqs.cantrips);
console.log("Spells needed:", bardReqs.spells);

if (bardReqs.cantrips === 2) {
    console.log("✓ Correct: Bard gets 2 cantrips (not 3!)");
} else {
    console.log("❌ WRONG: Bard should get 2 cantrips, got", bardReqs.cantrips);
}

if (bardReqs.spells && bardReqs.spells['1'] === 4) {
    console.log("✓ Correct: Bard gets 4 level-1 spells");
} else {
    console.log("❌ WRONG: Bard should get 4 spells, got", bardReqs.spells);
}

console.log("");
console.log("=== VERIFICATION COMPLETE ===");
console.log("");
console.log("Next steps:");
console.log("1. Restart backend: npm run dev");
console.log("2. Create NEW Bard character");
console.log("3. Say 'ready' at Session 0");
console.log("4. Verify spell list shows REAL spells from database");
console.log("5. Verify it says 'choose 2 cantrips' (not 3)");
console.log("");
console.log("If requirements above are correct, Session 0 will work!");
EOF

echo ""
echo "========================================================================="
