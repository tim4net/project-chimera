/**
 * Onboarding Service
 * - Generates a dramatic, personalized opening for a character using Gemini.
 * - Creates DM conversation entries for the narrative and greeting.
 * - Creates an initial quest tailored to the character's background.
 * - Creates an opening journal entry capturing the scene.
 *
 * Model selection:
 * - Uses process.env.GEMINI_MODEL if set (recommended: "gemini-2.5-pro").
 * - Falls back to "gemini-2.5-pro", then "gemini-pro".
 */

import { supabaseServiceClient } from './supabaseClient';
import { getModel } from './gemini';

type BackstoryData = {
  ideal?: string;
  bond?: string;
  flaw?: string;
  [key: string]: unknown;
};

export type CharacterForOnboarding = {
  id: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  backstory?: BackstoryData | null;
};

export type InitialQuest = {
  title: string;
  summary: string;
  objectives?: string[];
  recommendedFirstAction?: string;
  tags?: string[];
};

export type OnboardingContent = {
  narrative: string;
  initialQuest: InitialQuest;
  chroniclerGreeting: string;
};

export type TriggerOnboardingResult = {
  alreadyOnboarded: boolean;
  content: OnboardingContent;
  records: {
    narrativeMessageId?: string;
    greetingMessageId?: string;
    questId?: string;
    journalEntryId?: string;
  };
};

const pickModelName = (): string => {
  const envModel = process.env.GEMINI_MODEL;
  if (envModel && envModel.trim().length > 0) return envModel.trim();
  // Preferred default model per requirements; falls back to legacy name.
  return 'gemini-2.5-pro';
};

function buildOnboardingPrompt(c: CharacterForOnboarding): string {
  // Normalize backstory bits
  const ideal = c.backstory && typeof c.backstory === 'object' ? (c.backstory.ideal ?? '') : '';
  const bond = c.backstory && typeof c.backstory === 'object' ? (c.backstory.bond ?? '') : '';
  const flaw = c.backstory && typeof c.backstory === 'object' ? (c.backstory.flaw ?? '') : '';

  return `
You are to produce ONLY a single JSON object (no markdown fences) for a personalized character onboarding in a dark fantasy setting called Wayward Hamlet. The JSON MUST strictly match this schema:

{
  "narrative": string,       // 2-3 paragraphs; sets scene in Wayward Hamlet; ties to background and backstory (ideal, bond, flaw)
  "initialQuest": {
    "title": string,         // short, evocative name (e.g., "Whispers in the Temple Ruins")
    "summary": string,       // 2-4 sentences; personalized hook based on background
    "objectives": string[],  // 2-5 concise steps
    "recommendedFirstAction": string,  // a concrete first action prompt
    "tags": string[]         // include "onboarding" and the character's background (e.g., "Acolyte")
  },
  "chroniclerGreeting": string // 1-2 lines, diegetic opening from The Chronicler welcoming and asking what to do first
}

Constraints:
- Narrative: 2-3 paragraphs, dramatic, references Wayward Hamlet explicitly.
- Weave in the character's background and backstory: ideal, bond, flaw.
- Ensure the quest hook is tailored: examples:
  - Soldier => bandits, patrols, skirmish traces
  - Acolyte => relics, lost rites, temple ruins, whispers of faith
  - Criminal => debts, past associates, heat from the law
  - Sage => ancient texts, runes, lost knowledge
  - Folk Hero => villagers in need, rumors, protection
  - Noble => obligations, patronage, politics
- The Chronicler's greeting is distinct from the narrative and welcomes the character, ending with a prompt question.

Character:
- Name: ${c.name}
- Race: ${c.race}
- Class: ${c.class}
- Background: ${c.background}
- Alignment: ${c.alignment}
- Backstory: ideal="${ideal}", bond="${bond}", flaw="${flaw}"

Output: Return ONLY the JSON object, no commentary.
`.trim();
}

function fallbackQuestForBackground(background: string): InitialQuest {
  const map: Record<string, InitialQuest> = {
    Soldier: {
      title: 'Tracks at the Old Palisade',
      summary:
        'Reports of organized bandits have the villagers frightened. Fresh boot-prints were seen near the collapsed palisade east of Wayward Hamlet. If someone doesn’t act, trade will choke and the town’s hope will falter.',
      objectives: [
        'Speak with the militia sergeant by the east gate.',
        'Survey the old palisade and record any markings.',
        'Follow the freshest trail without being seen.'
      ],
      recommendedFirstAction: 'Find the militia sergeant at the east gate and ask for a sitrep.',
      tags: ['onboarding', 'Soldier']
    },
    Acolyte: {
      title: 'Whispers in the Temple Ruins',
      summary:
        'North of Wayward Hamlet lie the weathered stones of a temple long fallen—locals whisper of pale lights and soft chanting on windless nights. If faith guided you here, perhaps so did purpose.',
      objectives: [
        'Ask the innkeep about rumors of the northern ruins.',
        'Locate the shrine stone within the ruins.',
        'Record any symbols or liturgical fragments you find.'
      ],
      recommendedFirstAction: 'Question the innkeep about the temple ruins rumored to the north.',
      tags: ['onboarding', 'Acolyte']
    },
    Criminal: {
      title: 'Past Due Shadows',
      summary:
        'A familiar sigil scrawled on a barn door says your past has sniffed you out. Someone is sending a message—and not a friendly one. The Hamlet may hide you, or betray you.',
      objectives: [
        'Identify who painted the sigil near the market square.',
        'Destroy or alter the mark to break the trail.',
        'Meet a discreet contact by moonrise at the mill.'
      ],
      recommendedFirstAction: 'Inspect the barn door with the sigil and ask a vendor who noticed it first.',
      tags: ['onboarding', 'Criminal']
    }
  };
  return map[background] ?? {
    title: 'Road-Dust and Rumors',
    summary:
      'Wayward Hamlet sits on the lip of wild country. Rumors cluster like crows over shuttered windows—missing folk, strange lights, and the hush of something watching. Fortune and danger are neighbors here.',
    objectives: [
      'Gather rumors at the inn.',
      'Mark a safe route to the north road.',
      'Choose one lead to pursue.'
    ],
    recommendedFirstAction: 'Take a quiet corner at the inn and ask for rumors about recent troubles.',
    tags: ['onboarding', background || 'Wanderer']
  };
}

function coerceOnboardingContent(raw: unknown, c: CharacterForOnboarding): OnboardingContent {
  // Defensive parsing to handle imperfect LLM output.
  const asObj = (raw && typeof raw === 'object') ? raw as Record<string, any> : {};
  const narrative = typeof asObj.narrative === 'string' && asObj.narrative.trim().length > 0
    ? asObj.narrative.trim()
    : `The road to Wayward Hamlet ends beneath a sky the color of bruised iron. ${c.name} arrives travel-worn, but resolute.`;

  const iq = asObj.initialQuest && typeof asObj.initialQuest === 'object' ? asObj.initialQuest as Record<string, any> : {};
  const initialQuest: InitialQuest = {
    ...fallbackQuestForBackground(c.background),
    ...(typeof iq.title === 'string' ? { title: iq.title } : {}),
    ...(typeof iq.summary === 'string' ? { summary: iq.summary } : {}),
    ...(Array.isArray(iq.objectives) ? { objectives: iq.objectives.filter((x: any) => typeof x === 'string') } : {}),
    ...(typeof iq.recommendedFirstAction === 'string' ? { recommendedFirstAction: iq.recommendedFirstAction } : {}),
    ...(Array.isArray(iq.tags) ? { tags: iq.tags.filter((x: any) => typeof x === 'string') } : {})
  };

  const chroniclerGreeting =
    typeof asObj.chroniclerGreeting === 'string' && asObj.chroniclerGreeting.trim().length > 0
      ? asObj.chroniclerGreeting.trim()
      : `The Chronicler: Welcome to Wayward Hamlet, ${c.name}. What would you do first?`;

  return { narrative, initialQuest, chroniclerGreeting };
}

export async function generateOnboarding(character: CharacterForOnboarding): Promise<OnboardingContent> {
  const model = await getModel('pro'); // Use pro model for quality
  const prompt = buildOnboardingPrompt(character);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 900,
        responseMimeType: 'application/json'
      }
    });
    const text = await result.response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Some Gemini variants may still wrap JSON in fences; try to strip if needed.
      const maybe = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(maybe);
    }
    return coerceOnboardingContent(parsed, character);
  } catch (error) {
    console.error('[OnboardingService] Gemini call failed; using fallback content:', error);
    return coerceOnboardingContent(null, character);
  }
}

async function findExistingOnboardingMessage(characterId: string) {
  const { data, error } = await supabaseServiceClient
    .from('dm_conversations')
    .select('*')
    .eq('character_id', characterId)
    .eq('metadata->>messageType', 'onboarding')
    .limit(1);

  if (error) {
    console.error('[OnboardingService] Failed to check existing onboarding messages:', error);
    return null;
  }
  return (data && data.length > 0) ? data[0] : null;
}

type StoreArtifactsResult = {
  narrativeMessageId?: string;
  greetingMessageId?: string;
  questId?: string;
  journalEntryId?: string;
};

async function storeOnboardingArtifacts(characterId: string, content: OnboardingContent): Promise<StoreArtifactsResult> {
  const timestamp = new Date().toISOString();
  const records: StoreArtifactsResult = {};

  // 1) Create quest
  try {
    const questInsert = {
      character_id: characterId,
      title: content.initialQuest.title,
      description: content.initialQuest.summary,
      status: 'active',
      objectives: content.initialQuest.objectives ?? [],
      metadata: {
        source: 'onboarding',
        tags: content.initialQuest.tags ?? ['onboarding'],
        recommendedFirstAction: content.initialQuest.recommendedFirstAction ?? null,
        createdAt: timestamp
      }
    };

    const { data: quest, error: questError } = await supabaseServiceClient
      .from('quests')
      .insert(questInsert)
      .select('id')
      .single();

    if (questError) {
      console.error('[OnboardingService] Failed to create quest:', questError);
    } else if (quest) {
      records.questId = quest.id;
    }
  } catch (e) {
    console.error('[OnboardingService] Quest creation exception:', e);
  }

  // 2) DM conversation: narrative
  try {
    const narrativeInsert = {
      character_id: characterId,
      role: 'dm',
      content: content.narrative,
      metadata: {
        timestamp,
        messageType: 'onboarding',
        questId: records.questId ?? null
      }
    };

    const { data: narrative, error: narrativeError } = await supabaseServiceClient
      .from('dm_conversations')
      .insert(narrativeInsert)
      .select('id')
      .single();

    if (narrativeError) {
      console.error('[OnboardingService] Failed to insert onboarding narrative:', narrativeError);
    } else if (narrative) {
      records.narrativeMessageId = narrative.id;
    }
  } catch (e) {
    console.error('[OnboardingService] Narrative message creation exception:', e);
  }

  // 3) DM conversation: greeting
  try {
    const greetingInsert = {
      character_id: characterId,
      role: 'dm',
      content: content.chroniclerGreeting,
      metadata: {
        timestamp,
        messageType: 'onboarding_greeting',
        questId: records.questId ?? null
      }
    };

    const { data: greeting, error: greetError } = await supabaseServiceClient
      .from('dm_conversations')
      .insert(greetingInsert)
      .select('id')
      .single();

    if (greetError) {
      console.error('[OnboardingService] Failed to insert onboarding greeting:', greetError);
    } else if (greeting) {
      records.greetingMessageId = greeting.id;
    }
  } catch (e) {
    console.error('[OnboardingService] Greeting message creation exception:', e);
  }

  // 4) Journal entry
  try {
    const journalInsert = {
      character_id: characterId,
      title: 'Arrival at Wayward Hamlet',
      content: `${content.narrative}\n\n${content.chroniclerGreeting}`,
      tags: ['onboarding', 'opening'],
      metadata: {
        createdAt: timestamp,
        questId: records.questId ?? null
      }
    };

    const { data: journal, error: journalError } = await supabaseServiceClient
      .from('journal_entries')
      .insert(journalInsert)
      .select('id')
      .single();

    if (journalError) {
      console.error('[OnboardingService] Failed to create journal entry:', journalError);
    } else if (journal) {
      records.journalEntryId = journal.id;
    }
  } catch (e) {
    console.error('[OnboardingService] Journal creation exception:', e);
  }

  return records;
}

async function loadCharacterForOnboarding(characterId: string): Promise<CharacterForOnboarding | null> {
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('id, name, race, class, background, alignment, backstory')
    .eq('id', characterId)
    .single();

  if (error) {
    console.error('[OnboardingService] Failed to load character:', error);
    return null;
  }

  let backstoryObj: BackstoryData | null = null;
  if (data?.backstory) {
    try {
      backstoryObj = typeof data.backstory === 'string' ? JSON.parse(data.backstory) : data.backstory;
    } catch {
      backstoryObj = null;
    }
  }

  return {
    id: data.id,
    name: data.name,
    race: data.race,
    class: data.class,
    background: data.background,
    alignment: data.alignment,
    backstory: backstoryObj
  };
}

/**
 * Ensures onboarding exists. If already created (dm_conversations.metadata.messageType = 'onboarding'),
 * returns the existing onboarding content by reconstructing from stored messages and any onboarding quest found.
 */
export async function triggerOnboardingForCharacter(characterId: string): Promise<TriggerOnboardingResult> {
  const existingMsg = await findExistingOnboardingMessage(characterId);
  if (existingMsg) {
    // Try to gather associated greeting, quest, and journal
    const { data: greet, error: greetErr } = await supabaseServiceClient
      .from('dm_conversations')
      .select('content')
      .eq('character_id', characterId)
      .eq('metadata->>messageType', 'onboarding_greeting')
      .limit(1);

    const narrative = typeof existingMsg.content === 'string' ? existingMsg.content : '';
    const chroniclerGreeting = !greetErr && greet && greet.length > 0 ? (greet[0].content as string) : 'The Chronicler: Welcome. What do you do first?';

    // Attempt to fetch a quest tagged as onboarding
    const { data: quest, error: questErr } = await supabaseServiceClient
      .from('quests')
      .select('id, title, description, objectives, metadata')
      .eq('character_id', characterId)
      .contains('metadata', { source: 'onboarding' })
      .limit(1);

    const initialQuest: InitialQuest = quest && quest.length > 0
      ? {
          title: quest[0].title,
          summary: quest[0].description,
          objectives: (quest[0] as any).objectives || [],
          recommendedFirstAction: (quest[0] as any)?.metadata?.recommendedFirstAction || undefined,
          tags: (quest[0] as any)?.metadata?.tags || ['onboarding']
        }
      : fallbackQuestForBackground('Wanderer');

    return {
      alreadyOnboarded: true,
      content: { narrative, initialQuest, chroniclerGreeting },
      records: {
        narrativeMessageId: existingMsg.id,
        greetingMessageId: undefined,
        questId: quest && quest.length > 0 ? quest[0].id : undefined,
        journalEntryId: undefined
      }
    };
  }

  // Otherwise, create onboarding
  const character = await loadCharacterForOnboarding(characterId);
  if (!character) {
    throw new Error('Character not found or failed to load');
  }

  const content = await generateOnboarding(character);
  const records = await storeOnboardingArtifacts(characterId, content);

  return {
    alreadyOnboarded: false,
    content,
    records
  };
}
