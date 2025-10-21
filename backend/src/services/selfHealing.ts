/**
 * Self-Healing DM System
 * Writes issue reports that Claude Code monitors and fixes automatically
 */

import path from 'path';
import fs from 'fs/promises';

const PROJECT_ROOT = process.env.SELF_HEALING_PROJECT_ROOT || path.resolve(__dirname, '../../..');
const ISSUES_DIR = path.join(PROJECT_ROOT, 'dm-issues');

interface HealingResult {
  success: boolean;
  issueFile: string;
  explanation: string;
  filesModified?: string[];
  commitHash?: string;
}

/**
 * Create issue report for Claude Code to fix
 * This writes a detailed diagnostic file that Claude Code will monitor and fix
 */
export async function healDMResponse(
  playerMessage: string,
  dmResponse: string,
  issuesFound: string[],
  characterContext: string,
  playerFeedback?: string
): Promise<HealingResult> {
  try {
    console.log('[SelfHealing] Creating issue report...');

    // Ensure dm-issues directory exists
    await fs.mkdir(ISSUES_DIR, { recursive: true });

    // Generate diagnostic report
    const diagnostic = generateDiagnostic(
      playerMessage,
      dmResponse,
      issuesFound,
      characterContext,
      playerFeedback
    );

    // Write to dm-issues directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const issueFile = path.join(ISSUES_DIR, `issue-${timestamp}.md`);

    await fs.writeFile(issueFile, diagnostic);

    console.log('[SelfHealing] Issue report created:', issueFile);

    return {
      success: true,
      issueFile,
      explanation: `Issue report created at ${issueFile}. Claude Code will monitor and fix this automatically.`,
    };
  } catch (error) {
    console.error('[SelfHealing] Failed to create issue report:', error);
    return {
      success: false,
      issueFile: '',
      explanation: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate diagnostic report for Claude Code
 */
function generateDiagnostic(
  playerMessage: string,
  dmResponse: string,
  issuesFound: string[],
  characterContext: string,
  playerFeedback?: string
): string {
  return `# DM Response Issue - Requires Fix

**Created:** ${new Date().toISOString()}
**Status:** PENDING

## Problem Summary

The Chronicler (AI DM) gave an incorrect response that violates D&D 5e rules or game logic.

## Issues Detected

${issuesFound.map(issue => `- ${issue}`).join('\n')}

## The Interaction

**Player said:**
\`\`\`
${playerMessage}
\`\`\`

**The Chronicler responded:**
\`\`\`
${dmResponse}
\`\`\`

${playerFeedback ? `\n**Player's feedback:**\n\`\`\`\n${playerFeedback}\n\`\`\`\n` : ''}

## Character Context

${characterContext}

## Files That May Need Fixing

The system failed to prevent this invalid response. Likely culprits:

### 1. Action Validator
**File:** \`backend/src/services/actionValidator.ts\`
- Missing pattern to catch this type of impossible action
- Add to \`performDeterministicChecks()\` function
- Or improve AI validation prompt in \`VALIDATOR_SYSTEM_PROMPT\`

### 2. Intent Detector
**File:** \`backend/src/services/intentDetector.ts\`
- May need better pattern recognition for this action type
- Check \`detectIntent()\` function

### 3. Narrator Prompt
**File:** \`backend/src/services/narratorLLM.ts\`
- System prompt (\`NARRATIVE_SYSTEM_PROMPT\`) may need stronger rule enforcement instructions
- Add specific examples of what NOT to allow

## Instructions for Claude Code

1. Read the files mentioned above
2. Identify which component(s) failed to catch this specific issue
3. Make minimal, targeted edits to prevent this type of response in the future
4. Commit your changes with: \`fix(self-healing): prevent [issue description]\`
5. Delete this issue file when done

## Quick Fixes to Consider

- Add deterministic pattern for impossible actions like this one
- Strengthen system prompts with explicit "DO NOT" rules
- Add this specific case to test suite

---

**When fixed, delete this file or mark status as FIXED**
`;
}
