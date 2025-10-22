/**
 * Claude Code Review Service
 * Uses local Claude Code instance via MCP to review DM responses
 */

import type { CharacterRecord } from '../types';
import type { ActionResult } from '../types/actions';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface ReviewResult {
  issuesFound: string[];
  correctedResponse: string;
  originalResponse: string;
  explanation: string;
}

/**
 * Review the last DM response using Claude Code
 */
export async function reviewLastDMResponse(
  playerMessage: string,
  dmResponse: string,
  actionResults: ActionResult[],
  character: CharacterRecord,
  playerFeedback?: string
): Promise<ReviewResult> {
  try {
    // Build context for Claude Code review
    const reviewPrompt = buildReviewPrompt(
      playerMessage,
      dmResponse,
      actionResults,
      character,
      playerFeedback
    );

    // Write prompt to temp file for Claude Code
    const tempDir = '/tmp/nuaibria-reviews';
    await fs.mkdir(tempDir, { recursive: true });
    const promptFile = path.join(tempDir, `review-${Date.now()}.txt`);
    await fs.writeFile(promptFile, reviewPrompt);

    // Call Claude Code via MCP using the zen chat tool
    // This requires the Claude Code CLI to be available
    const reviewResponse = await callClaudeCodeMCP(reviewPrompt);

    // Parse Claude's review
    const issuesFound = extractIssues(reviewResponse);
    const correctedResponse = extractCorrectedResponse(reviewResponse);
    const explanation = extractExplanation(reviewResponse);

    // Cleanup temp file
    await fs.unlink(promptFile).catch(() => {});

    return {
      issuesFound,
      correctedResponse: correctedResponse || dmResponse, // Fallback to original
      originalResponse: dmResponse,
      explanation,
    };
  } catch (error) {
    console.error('[ClaudeReview] Review failed:', error);
    // Fallback: return original response with error note
    return {
      issuesFound: ['Review service unavailable'],
      correctedResponse: dmResponse,
      originalResponse: dmResponse,
      explanation: 'Could not complete review - Claude Code unavailable',
    };
  }
}

/**
 * Build the review prompt for Claude Code
 */
function buildReviewPrompt(
  playerMessage: string,
  dmResponse: string,
  actionResults: ActionResult[],
  character: CharacterRecord,
  playerFeedback?: string
): string {
  const actionSummary = actionResults
    .map(r => `  - ${r.source.action.type}: ${r.outcome} (${r.success ? 'success' : 'failure'})`)
    .join('\n');

  return `# DM Response Review Request

You are reviewing a D&D 5e AI Dungeon Master's response for rule compliance and quality.

## Character
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class}
- Level: ${character.level}
- HP: ${character.hp_current}/${character.hp_max}
- Position: (${character.position_x}, ${character.position_y})

## Interaction

**Player said:**
"${playerMessage}"

**Game Engine Results:**
${actionSummary}

**The Chronicler responded:**
"${dmResponse}"

${playerFeedback ? `\n**Player's concern:**\n"${playerFeedback}"\n` : ''}

## Your Task

Analyze The Chronicler's response for:
1. **D&D 5e Rule Compliance**: Did it allow impossible actions? (e.g., flight without magic, instant kills, god-mode)
2. **Physics Compliance**: Did it violate basic physics? (e.g., playing swords as flutes)
3. **Narrative Consistency**: Does the narrative match the action results?
4. **Character Abilities**: Did it allow abilities the character doesn't have?

## Response Format

Provide your review in this exact format:

### Issues Found
- [List any issues, or write "None" if response was correct]

### Corrected Response
[If issues found, provide a better DM response that follows the rules. If no issues, write "Original response is correct."]

### Explanation
[Brief explanation of what was wrong and why your correction is better]
`;
}

/**
 * Call Claude API for review
 */
async function callClaudeCodeMCP(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured - cannot perform review');
  }

  console.log('[ClaudeReview] Calling Claude API for review...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', // Latest Sonnet model
      max_tokens: 2048,
      temperature: 0.3, // Low temperature for consistent reviews
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ClaudeReview] Claude API error:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const reviewText = data.content[0]?.text;
  if (!reviewText) {
    throw new Error('Empty response from Claude API');
  }

  console.log('[ClaudeReview] Review completed, length:', reviewText.length);
  return reviewText;
}

/**
 * Extract issues from Claude's review
 */
function extractIssues(review: string): string[] {
  const issuesMatch = review.match(/### Issues Found\n([\s\S]*?)\n###/);
  if (!issuesMatch) return [];

  const issuesText = issuesMatch[1].trim();
  if (issuesText.toLowerCase() === 'none') return [];

  return issuesText
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
}

/**
 * Extract corrected response from Claude's review
 */
function extractCorrectedResponse(review: string): string | null {
  const correctedMatch = review.match(/### Corrected Response\n([\s\S]*?)\n###/);
  if (!correctedMatch) return null;

  const corrected = correctedMatch[1].trim();
  if (corrected.toLowerCase().includes('original response is correct')) return null;

  return corrected;
}

/**
 * Extract explanation from Claude's review
 */
function extractExplanation(review: string): string {
  const explanationMatch = review.match(/### Explanation\n([\s\S]*?)$/);
  return explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
}
