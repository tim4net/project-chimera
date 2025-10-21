#!/bin/bash
# DM Issues Watcher
# Monitors dm-issues/ folder and automatically invokes Claude Code to fix problems

ISSUES_DIR="./dm-issues"
LOCKFILE="/tmp/dm-issues-watcher.lock"

# Ensure only one watcher runs
if [ -f "$LOCKFILE" ]; then
  echo "Watcher already running (lockfile exists: $LOCKFILE)"
  exit 1
fi

touch "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

echo "🔍 Watching $ISSUES_DIR for DM issue reports..."
echo "Press Ctrl+C to stop"

# Create issues directory if it doesn't exist
mkdir -p "$ISSUES_DIR"

# Track processed files to avoid re-processing
declare -A PROCESSED

while true; do
  # Find all pending issue files
  for issue_file in "$ISSUES_DIR"/issue-*.md; do
    # Skip if glob didn't match any files
    [ -e "$issue_file" ] || continue

    # Skip if already processed
    [ "${PROCESSED[$issue_file]}" = "1" ] && continue

    echo ""
    echo "🚨 New DM issue detected: $issue_file"
    echo "📖 Reading issue report..."

    # Read the issue
    cat "$issue_file"

    echo ""
    echo "🤖 Invoking Claude Code to fix this issue..."
    echo ""

    # Invoke Claude Code with the issue file as context
    # This will open an interactive Claude Code session
    # You can automate this further with --non-interactive if available
    claude < "$issue_file"

    # Mark as processed
    PROCESSED[$issue_file]=1

    echo ""
    echo "✅ Claude Code session completed"
    echo "🗑️  Deleting issue file..."
    rm -f "$issue_file"

    echo "✨ Issue resolved!"
  done

  # Sleep before next check
  sleep 2
done
