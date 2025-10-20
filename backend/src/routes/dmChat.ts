/**
 * @file DM Chat API - The Chronicler conversational AI interface
 * This is the PRIMARY gameplay interface where players interact with The Chronicler (AI DM)
 */

import { Router, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import { getDmResponse } from '../services/gemini';
import { getDmResponseLocal } from '../services/localLLM';
import type { CharacterRecord } from '../types';

const router = Router();

// Types for the chat API
interface ChatMessage {
  role: 'player' | 'dm' | 'system';
  content: string;
}

interface ChatRequest {
  characterId: string;
  message: string;
  conversationHistory?: ChatMessage[];
}

interface StateChanges {
  position?: { x: number; y: number };
  hp?: number;
  xp?: number;
  [key: string]: unknown;
}

interface JournalEntryData {
  type: 'exploration' | 'combat' | 'quest' | 'narrative' | 'system';
  content: string;
}

interface ChatResponse {
  response: string;
  stateChanges: StateChanges;
  journalEntry: JournalEntryData | null;
  triggerActivePhase: boolean;
}

/**
 * POST /api/chat/dm
 * Send a message to The Chronicler and get AI-generated DM response
 */
router.post(
  '/',
  requireAuth,
  async (req, res): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { characterId, message, conversationHistory } = authenticatedReq.body as ChatRequest;

      // Validation
      if (!characterId || typeof characterId !== 'string') {
        res.status(400).json({ error: 'Character ID is required' });
        return;
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ error: 'Message cannot be empty' });
        return;
      }

      // Verify character belongs to authenticated user
      const { data: character, error: characterError } = await supabaseServiceClient
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (characterError || !character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      // Store player message in dm_conversations
      const { error: messageInsertError } = await supabaseServiceClient
        .from('dm_conversations')
        .insert({
          character_id: characterId,
          role: 'player',
          content: message,
          metadata: {
            timestamp: new Date().toISOString(),
            characterState: {
              hp: character.hp_current,
              position: { x: character.position_x, y: character.position_y },
            },
          },
        });

      if (messageInsertError) {
        console.error('[DM Chat] Failed to store player message:', messageInsertError);
        res.status(500).json({ error: 'Failed to store message' });
        return;
      }

      // Call Local LLM for DM response (Gemini used as fallback)
      let narrative: string;
      let jsonPayload: any;

      try {
        const localResult = await getDmResponseLocal(
          character as CharacterRecord,
          conversationHistory || [],
          message
        );
        narrative = localResult.narrative;
        jsonPayload = localResult.jsonPayload;
        console.log('[DM Chat] Response from Local LLM');
      } catch (localError) {
        console.warn('[DM Chat] Local LLM failed, falling back to Gemini:', localError);
        const geminiResult = await getDmResponse(
          character as CharacterRecord,
          conversationHistory || [],
          message
        );
        narrative = geminiResult.narrative;
        jsonPayload = geminiResult.jsonPayload;
        console.log('[DM Chat] Response from Gemini (fallback)');
      }

      // Build response from AI
      const dmResponse = {
        response: narrative,
        stateChanges: jsonPayload?.stateChanges || {},
        journalEntry: jsonPayload?.journalEntry || null,
        triggerActivePhase: jsonPayload?.triggerActivePhase || false,
      };

      // Apply state changes
      const stateChanges: StateChanges = {};
      if (dmResponse.stateChanges.position) {
        stateChanges.position = dmResponse.stateChanges.position;
        const { error: positionError } = await supabaseServiceClient
          .from('characters')
          .update({
            position_x: dmResponse.stateChanges.position.x,
            position_y: dmResponse.stateChanges.position.y,
          })
          .eq('id', characterId);

        if (positionError) {
          console.error('[DM Chat] Failed to update position:', positionError);
        }
      }

      if (dmResponse.stateChanges.hp !== undefined) {
        stateChanges.hp = dmResponse.stateChanges.hp;
        const newHp = Math.max(0, character.hp_current + dmResponse.stateChanges.hp);
        const { error: hpError } = await supabaseServiceClient
          .from('characters')
          .update({ hp_current: newHp })
          .eq('id', characterId);

        if (hpError) {
          console.error('[DM Chat] Failed to update HP:', hpError);
        }
      }

      if (dmResponse.stateChanges.xp !== undefined && dmResponse.stateChanges.xp > 0) {
        stateChanges.xp = dmResponse.stateChanges.xp;
        const newXp = (character.xp || 0) + dmResponse.stateChanges.xp;
        const { error: xpError } = await supabaseServiceClient
          .from('characters')
          .update({ xp: newXp })
          .eq('id', characterId);

        if (xpError) {
          console.error('[DM Chat] Failed to update XP:', xpError);
        }
      }

      // Create journal entry if provided
      if (dmResponse.journalEntry) {
        const { error: journalError } = await supabaseServiceClient
          .from('journal_entries')
          .insert({
            character_id: characterId,
            entry_type: dmResponse.journalEntry.type,
            content: dmResponse.journalEntry.content,
            metadata: {
              playerMessage: message,
              dmResponse: dmResponse.response,
              stateChanges,
            },
          });

        if (journalError) {
          console.error('[DM Chat] Failed to create journal entry:', journalError);
        }
      }

      // Store DM response in dm_conversations
      const { error: dmMessageError } = await supabaseServiceClient
        .from('dm_conversations')
        .insert({
          character_id: characterId,
          role: 'dm',
          content: dmResponse.response,
          metadata: {
            timestamp: new Date().toISOString(),
            stateChanges,
            triggerActivePhase: dmResponse.triggerActivePhase,
          },
        });

      if (dmMessageError) {
        console.error('[DM Chat] Failed to store DM response:', dmMessageError);
      }

      // Return response to client
      res.status(200).json({
        response: dmResponse.response,
        stateChanges,
        journalEntry: dmResponse.journalEntry,
        triggerActivePhase: dmResponse.triggerActivePhase,
      } as ChatResponse);
    } catch (error) {
      console.error('[DM Chat] Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
