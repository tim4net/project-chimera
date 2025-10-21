/**
 * Review Executor - Handles REVIEW_DM_RESPONSE actions
 * This triggers Claude to review and correct The Chronicler's last response
 */

import type { CharacterRecord } from '../types';
import type { ActionResult, ReviewDMResponseAction } from '../types/actions';
import { reviewLastDMResponse } from './claudeReview';
import { healDMResponse } from './selfHealing';
import { supabaseServiceClient } from './supabaseClient';

/**
 * Execute REVIEW_DM_RESPONSE action
 * Fetches last interaction, sends to Claude for review, returns corrected response
 */
export async function executeReviewDMResponse(
  action: ReviewDMResponseAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  try {
    console.log('[ReviewExecutor] Fetching last DM conversation...');

    // Fetch last 2 messages from conversation (player message + DM response)
    const { data: messages, error } = await supabaseServiceClient
      .from('dm_conversations')
      .select('*')
      .eq('character_id', character.id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (error || !messages || messages.length < 2) {
      console.error('[ReviewExecutor] Failed to fetch conversation:', error);
      return {
        actionId: action.actionId,
        success: false,
        outcome: 'failure',
        rolls: {},
        stateChanges: [],
        source: {
          action,
          ruleEngineVersion: '1.0.0',
          timestamp: startTime,
        },
        narrativeContext: {
          summary: "I couldn't find a recent conversation to review. Try sending a message first, then use @claudecode.",
          mood: 'neutral',
        },
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Last message should be DM, second-to-last should be player
    const dmMessage = messages[0];
    const playerMessage = messages[1];

    if (dmMessage.role !== 'dm' || playerMessage.role !== 'player') {
      return {
        actionId: action.actionId,
        success: false,
        outcome: 'failure',
        rolls: {},
        stateChanges: [],
        source: {
          action,
          ruleEngineVersion: '1.0.0',
          timestamp: startTime,
        },
        narrativeContext: {
          summary: "The conversation history doesn't match the expected format. Please try again after a normal interaction.",
          mood: 'neutral',
        },
        executionTimeMs: Date.now() - startTime,
      };
    }

    console.log('[ReviewExecutor] Reviewing interaction:', {
      player: playerMessage.content.substring(0, 50),
      dm: dmMessage.content.substring(0, 50),
    });

    // Get action results from metadata if available
    const actionResults = (dmMessage.metadata as any)?.actionResults || [];

    // Call Claude for review
    const review = await reviewLastDMResponse(
      playerMessage.content,
      dmMessage.content,
      actionResults,
      character,
      action.playerFeedback
    );

    console.log('[ReviewExecutor] Review completed:', {
      issuesFound: review.issuesFound.length,
      hasCorrectedResponse: !!review.correctedResponse,
    });

    // Check if there are actual issues to fix
    const hasIssues = review.issuesFound.length > 0 &&
                      !review.issuesFound.includes('None') &&
                      review.correctedResponse !== dmMessage.content;

    let healingResult = null;

    // TRIGGER SELF-HEALING: Fix the source code!
    if (hasIssues) {
      console.log('[ReviewExecutor] Issues detected - triggering self-healing...');

      const characterContextStr = `Level ${character.level} ${character.race} ${character.class}`;

      healingResult = await healDMResponse(
        playerMessage.content,
        dmMessage.content,
        review.issuesFound,
        characterContextStr,
        action.playerFeedback
      );

      console.log('[ReviewExecutor] Self-healing result:', {
        success: healingResult.success,
        issueFile: healingResult.issueFile,
      });
    }

    // Build response narrative
    let responseText: string;

    if (!hasIssues) {
      responseText = `**Claude Code Review**\n\n✅ No issues found - The Chronicler's response was correct!\n\n${review.explanation}`;
    } else if (healingResult?.success) {
      responseText = `**🔧 Self-Healing Triggered**\n\n**Issues Found:**\n${review.issuesFound.map(i => `- ${i}`).join('\n')}\n\n**Corrected Response:**\n${review.correctedResponse}\n\n**System Status:**\n📝 Issue report created: \`${healingResult.issueFile}\`\n🤖 Claude Code will automatically fix this issue\n⏳ Changes will hot-reload when applied\n\n**Explanation:**\n${review.explanation}\n\n_Claude Code is monitoring the dm-issues folder and will apply fixes shortly._`;
    } else {
      responseText = `**Claude Code Review**\n\n**Issues Found:**\n${review.issuesFound.map(i => `- ${i}`).join('\n')}\n\n**Corrected Response:**\n${review.correctedResponse}\n\n**Self-Healing Status:**\n⚠️ ${healingResult?.explanation || 'Failed to create issue report'}\n\n${review.explanation}`;
    }

    return {
      actionId: action.actionId,
      success: true,
      outcome: hasIssues ? 'partial' : 'success',
      rolls: {},
      stateChanges: [], // Reviews don't change game state
      source: {
        action,
        ruleEngineVersion: '1.0.0',
        timestamp: startTime,
      },
      narrativeContext: {
        summary: responseText,
        mood: hasIssues ? 'neutral' : 'triumph',
      },
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[ReviewExecutor] Review failed:', error);
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: '1.0.0',
        timestamp: startTime,
      },
      narrativeContext: {
        summary: `Review failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure ANTHROPIC_API_KEY is configured.`,
        mood: 'neutral',
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}
