/**
 * @file Quest Types - Radiant quest system (Layer 1)
 */

export type QuestTemplateType = 'fetch' | 'clear' | 'scout' | 'deliver';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'abandoned';
export type ObjectiveType = 'collect_items' | 'kill_enemies' | 'reach_location';

export interface QuestTemplate {
  id: string;
  template_type: QuestTemplateType;
  title_template: string;
  description_template: string;
  objective_type: ObjectiveType;
  target_quantity: number;
  difficulty: QuestDifficulty;
  base_xp_reward: number;
  base_gold_reward: number;
  created_at: string;
}

export interface CharacterQuest {
  id: string;
  character_id: string;
  template_id: string;
  title: string;
  description: string;
  objective_type: ObjectiveType;
  objective_target: string | null;
  current_progress: number;
  target_quantity: number;
  status: QuestStatus;
  xp_reward: number;
  gold_reward: number;
  item_rewards: Array<{ name: string; quantity: number }>;
  offered_at: string;
  accepted_at: string;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface QuestProgress {
  questId: string;
  progress: number; // New progress value
  completed: boolean;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items: Array<{ name: string; quantity: number }>;
}
