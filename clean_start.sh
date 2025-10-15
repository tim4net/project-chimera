#!/bin/bash

# -----------------------------------------------------------------------------
# clean_start.sh - Clean up script for Project Chimera
#
# This script removes all build artifacts and container state to allow
# a fresh start of the orchestrator.
# -----------------------------------------------------------------------------

set -euo pipefail

echo "🧹 Cleaning up Project Chimera build artifacts..."
echo ""

# Stop and remove Supabase containers
echo "📦 Stopping Supabase containers..."
if podman compose -f supabase/docker/docker-compose.yml down 2>/dev/null; then
    echo "✓ Containers stopped"
else
    echo "⚠ No running containers or compose file not found"
fi
echo ""

# Remove backup files created by sed
echo "🗑️  Removing backup files..."
find supabase/docker -name "*.bak" -type f -delete 2>/dev/null && echo "✓ Backup files removed" || echo "⚠ No backup files found"
echo ""

# Reset state files
echo "📝 Resetting state files..."
echo '{}' > project_state.json
> current_plan.txt
> feedback.txt
> bug_reports.txt
> ai_prompt.txt
> ai_response.txt
> build.log
echo "✓ State files reset"
echo ""

# Restore original docker-compose.yml if backup exists
echo "🔄 Restoring original docker-compose.yml..."
if [ -f "supabase/docker/docker-compose.yml.bak" ]; then
    mv supabase/docker/docker-compose.yml.bak supabase/docker/docker-compose.yml
    echo "✓ Original docker-compose.yml restored"
else
    # If no backup, check if it needs to be reset from git
    if [ -d ".git" ] && [ -f "supabase/docker/docker-compose.yml" ]; then
        if git diff --quiet supabase/docker/docker-compose.yml 2>/dev/null; then
            echo "✓ docker-compose.yml is already in original state"
        else
            echo "⚠ docker-compose.yml has been modified. Restoring from git..."
            git checkout supabase/docker/docker-compose.yml 2>/dev/null && echo "✓ Restored from git" || echo "⚠ Could not restore from git"
        fi
    else
        echo "⚠ No backup or git repository found"
    fi
fi
echo ""

# Remove test files
echo "🧪 Removing test files..."
rm -f test_plan.txt
echo "✓ Test files removed"
echo ""

echo "=============================================="
echo "✅ Cleanup complete! Ready for fresh start."
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Review the configuration: CLAUDE.md, project.md, GEMINI.md"
echo "  2. Verify the setup: ./verify_setup.sh"
echo "  3. Run the orchestrator: ./build_orchestrator.sh"
echo ""
