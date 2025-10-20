#!/bin/bash
# Script to rename all "Nuaibria" references to "Nuaibria"
# Preserves case and formatting where possible

set -e

echo "========================================="
echo "Renaming Nuaibria → Nuaibria"
echo "========================================="
echo ""

# Function to replace in files
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local description=$3

    echo "Replacing: $description"

    find . -type f \( \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.json" -o \
        -name "*.sh" -o \
        -name "*.html" -o \
        -name "*.js" -o \
        -name "*.jsx" -o \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.toml" -o \
        -name "*.txt" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/legacy-backup/*" \
    -not -path "*/build/*" \
    -not -path "*/.ignored/*" \
    -exec sed -i.bak "s/$pattern/$replacement/g" {} \;

    # Count replacements
    local count=$(find . -name "*.bak" | wc -l)
    echo "  → Modified $count files"

    # Remove backup files
    find . -name "*.bak" -delete
}

# Perform replacements (order matters - most specific first)
replace_in_files "nuaibria" "nuaibria" "nuaibria → nuaibria"
replace_in_files "nuaibria" "nuaibria" "nuaibria → nuaibria"
replace_in_files "Nuaibria" "Nuaibria" "Nuaibria → Nuaibria"
replace_in_files "NUAIBRIA" "NUAIBRIA" "NUAIBRIA → NUAIBRIA"
replace_in_files "nuaibria" "nuaibria" "nuaibria → nuaibria"

# Container names (docker/podman specific patterns)
replace_in_files "nuaibria_backend" "nuaibria_backend" "nuaibria_backend → nuaibria_backend"
replace_in_files "nuaibria_frontend" "nuaibria_frontend" "nuaibria_frontend → nuaibria_frontend"

# CLI/TUI specific
replace_in_files "nuaibria-cli" "nuaibria-cli" "nuaibria-cli → nuaibria-cli"
replace_in_files "NuaibriaCLI" "NuaibriaCLI" "NuaibriaCLI → NuaibriaCLI"

echo ""
echo "========================================="
echo "Replacement complete!"
echo "========================================="
echo ""
echo "Files modified. Testing recommended:"
echo "  1. Check that code still compiles"
echo "  2. Verify documentation makes sense"
echo "  3. Test container builds"
echo ""
