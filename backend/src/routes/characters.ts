import { Router, type Request, type Response } from 'express';
import type { AuthError } from '@supabase/supabase-js';
import { validatePointBuy } from '../game/rules';
import { getStartingEquipment } from '../game/equipment';
import { generateOnboardingScene } from '../services/gemini';
import supabase from '../services/supabase';
import { supabaseServiceClient } from '../services/supabaseClient';
import type { AbilityScores, CharacterRecord, NewCharacterRecord } from '../types';

interface CharacterCreationBody {
  name?: string;
  race?: string;
  class?: string;
  background?: string;
  alignment?: string;
  abilityScores?: AbilityScores & Record<string, number>;
  skills?: Record<string, unknown> | null;
  backstory?: Record<string, unknown> | null;
  portraitUrl?: string | null;
}

const router = Router();

const handleSupabaseError = (res: Response, error: AuthError | null | undefined, status = 500): Response | undefined => {
  if (!error) {
    return undefined;
  }

  return res.status(status).json({ error: error.message });
};

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as CharacterRecord[]);
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
    }

    const accessToken = authHeader.slice(7);
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

    if (handleSupabaseError(res, authError, 401)) {
      return;
    }

    const user = authData?.user;

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const {
      name,
      race,
      class: characterClass,
      background,
      alignment,
      abilityScores,
      skills,
      backstory,
      portraitUrl
    } = req.body as CharacterCreationBody;

    if (!name || !race || !characterClass || !background || !alignment || !abilityScores) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scores: AbilityScores = {
      STR: abilityScores.STR,
      DEX: abilityScores.DEX,
      CON: abilityScores.CON,
      INT: abilityScores.INT,
      WIS: abilityScores.WIS,
      CHA: abilityScores.CHA
    };

    if (!validatePointBuy(scores)) {
      return res.status(400).json({ error: 'Invalid ability scores for point-buy' });
    }

    const conMod = Math.floor((abilityScores.CON - 10) / 2);
    const dexMod = Math.floor((abilityScores.DEX - 10) / 2);

    const hitDiceMap: Record<string, number> = {
      Barbarian: 12,
      Fighter: 10,
      Paladin: 10,
      Ranger: 10,
      Bard: 8,
      Cleric: 8,
      Druid: 8,
      Monk: 8,
      Rogue: 8,
      Warlock: 8,
      Sorcerer: 6,
      Wizard: 6
    };

    const classHitDie = hitDiceMap[characterClass] ?? 8;
    const maxHp = classHitDie + conMod;

    const raceSpeeds: Record<string, number> = {
      Aasimar: 30,
      Dragonborn: 30,
      Dwarf: 25,
      Elf: 30,
      Gnome: 25,
      Goliath: 30,
      Halfling: 25,
      Human: 30,
      Orc: 30,
      Tiefling: 30
    };

    const speed = raceSpeeds[race] ?? 30;
    const campaignSeed = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startingPosition = { x: 500, y: 500 } as const;
    const armorClass = 10 + dexMod;

    // Map full alignment names to database abbreviations
    const alignmentMap: Record<string, string> = {
      'Lawful Good': 'LG',
      'Neutral Good': 'NG',
      'Chaotic Good': 'CG',
      'Lawful Neutral': 'LN',
      'True Neutral': 'N',
      'Neutral': 'N',
      'Chaotic Neutral': 'CN',
      'Lawful Evil': 'LE',
      'Neutral Evil': 'NE',
      'Chaotic Evil': 'CE'
    };
    const alignmentCode = alignmentMap[alignment] ?? alignment;

    const characterPayload: NewCharacterRecord = {
      user_id: user.id,
      name,
      race,
      class: characterClass,
      background,
      alignment: alignmentCode,
      level: 1,
      xp: 0,
      ability_scores: scores,
      hp_max: maxHp,
      hp_current: maxHp,
      temporary_hp: 0,
      armor_class: armorClass,
      speed,
      hit_dice: { [classHitDie]: 1 },
      position: startingPosition,
      campaign_seed: campaignSeed,
      spell_slots: {},
      backstory: backstory ? JSON.stringify(backstory) : null,
      skills: skills ? JSON.stringify(skills) : null,
      portrait_url: portraitUrl ?? null,
      proficiency_bonus: 2
    };

    const { data: characterData, error } = await supabaseServiceClient
      .from('characters')
      .insert(characterPayload)
      .select()
      .single();

    if (error) {
      console.error('[Characters] create error:', error);
      return res.status(500).json({ error: 'Failed to create character', details: error.message });
    }

    const createdCharacter = characterData as CharacterRecord;
    console.info(`[Characters] Created ${createdCharacter.name} (${createdCharacter.id})`);

    // Placeholder hooks for future onboarding features
    void getStartingEquipment(characterClass);
    void generateOnboardingScene({
      name: createdCharacter.name,
      race: createdCharacter.race,
      class: createdCharacter.class
    }).catch((generationError: unknown) => {
      console.error('[Characters] onboarding scene generation failed:', generationError);
    });

    res.status(201).json(createdCharacter);
  } catch (error) {
    console.error('[Characters] create exception:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json(data as CharacterRecord);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as Partial<NewCharacterRecord>;

  const { data, error } = await supabaseServiceClient
    .from('characters')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as CharacterRecord);
});

export default router;
