/**
 * Party Service (ADR-003, ADR-004)
 * Foundation for multiplayer party system
 */

import { supabaseServiceClient } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// PARTY MANAGEMENT
// ============================================================================

/**
 * Create a new party
 */
export async function createParty(
  leaderCharacterId: string,
  partyName: string,
  campaignSeed: string
): Promise<{ success: boolean; partyId?: string; error?: string }> {
  // Check if character is already in a party
  const { data: existing } = await supabaseServiceClient
    .from('party_members')
    .select('party_id')
    .eq('character_id', leaderCharacterId)
    .single();

  if (existing) {
    return { success: false, error: 'Already in a party' };
  }

  // Create party
  const partyId = uuidv4();
  const { error: partyError } = await supabaseServiceClient
    .from('parties')
    .insert({
      id: partyId,
      name: partyName,
      campaign_seed: campaignSeed,
      leader_character_id: leaderCharacterId,
    });

  if (partyError) {
    return { success: false, error: partyError.message };
  }

  // Add leader as first member
  const { error: memberError } = await supabaseServiceClient
    .from('party_members')
    .insert({
      party_id: partyId,
      character_id: leaderCharacterId,
      role: 'leader',
    });

  if (memberError) {
    return { success: false, error: memberError.message };
  }

  return { success: true, partyId };
}

/**
 * Invite a character to party
 */
export async function inviteToParty(
  partyId: string,
  invitedCharacterId: string,
  invitedByCharacterId: string,
  message?: string
): Promise<{ success: boolean; inviteId?: string; error?: string }> {
  // Verify inviter is in the party
  const { data: membership } = await supabaseServiceClient
    .from('party_members')
    .select('role')
    .eq('party_id', partyId)
    .eq('character_id', invitedByCharacterId)
    .single();

  if (!membership) {
    return { success: false, error: 'You are not in this party' };
  }

  // Check if invitee is already in a party
  const { data: existingParty } = await supabaseServiceClient
    .from('party_members')
    .select('party_id')
    .eq('character_id', invitedCharacterId)
    .single();

  if (existingParty) {
    return { success: false, error: 'Character is already in a party' };
  }

  // Create invite
  const inviteId = uuidv4();
  const { error } = await supabaseServiceClient
    .from('party_invites')
    .insert({
      id: inviteId,
      party_id: partyId,
      invited_character_id: invitedCharacterId,
      invited_by_character_id: invitedByCharacterId,
      message: message || 'Join our party!',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, inviteId };
}

/**
 * Accept a party invite
 */
export async function acceptInvite(
  inviteId: string,
  characterId: string
): Promise<{ success: boolean; error?: string }> {
  // Fetch invite
  const { data: invite } = await supabaseServiceClient
    .from('party_invites')
    .select('*')
    .eq('id', inviteId)
    .eq('invited_character_id', characterId)
    .eq('status', 'pending')
    .single();

  if (!invite) {
    return { success: false, error: 'Invite not found or expired' };
  }

  // Update invite status
  await supabaseServiceClient
    .from('party_invites')
    .update({ status: 'accepted' })
    .eq('id', inviteId);

  // Add to party
  const { error } = await supabaseServiceClient
    .from('party_members')
    .insert({
      party_id: invite.party_id,
      character_id: characterId,
      role: 'member',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get party members
 */
export async function getPartyMembers(partyId: string) {
  const { data, error } = await supabaseServiceClient
    .from('party_members')
    .select(`
      character_id,
      role,
      joined_at,
      characters (
        name,
        level,
        class,
        hp_current,
        hp_max
      )
    `)
    .eq('party_id', partyId);

  return { data, error };
}

/**
 * Leave party
 */
export async function leaveParty(
  partyId: string,
  characterId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseServiceClient
    .from('party_members')
    .delete()
    .eq('party_id', partyId)
    .eq('character_id', characterId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
