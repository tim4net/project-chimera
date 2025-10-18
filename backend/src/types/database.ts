import type { CharacterRecord, ImageDimensions, NewCharacterRecord, StyleConfig } from './index';

export type AssetRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GeneratedImageRow {
  id: string;
  prompt_hash: string;
  context_type: string;
  image_url: string;
  prompt: string;
  style_version_id: string | null;
  dimensions: ImageDimensions;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GeneratedImageInsert {
  prompt_hash: string;
  context_type: string;
  image_url: string;
  prompt: string;
  style_version_id?: string | null;
  dimensions: ImageDimensions;
  metadata: Record<string, unknown>;
}

export interface GeneratedTextRow {
  id: string;
  context_key: string;
  text_type: string;
  content: string;
  context: Record<string, unknown>;
  style_version_id: string | null;
  llm_used: string;
  created_at: string;
}

export interface GeneratedTextInsert {
  context_key: string;
  text_type: string;
  content: string;
  context?: Record<string, unknown>;
  style_version_id?: string | null;
  llm_used: string;
}

export interface AssetRequestRow {
  id: string;
  request_hash: string;
  request_type: 'image' | 'text';
  status: AssetRequestStatus;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
}

export interface AssetRequestInsert {
  request_hash: string;
  request_type: 'image' | 'text';
  status?: AssetRequestStatus;
  started_at?: string | null;
}

export interface StyleVersionRow {
  id: string;
  version_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  style_config: StyleConfig;
}

export interface StyleVersionInsert {
  version_name: string;
  description?: string | null;
  is_active?: boolean;
  style_config: StyleConfig;
}

interface DatabaseTable<Row, Insert = Row, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
}

export interface Database {
  public: {
    Tables: {
      generated_images: DatabaseTable<GeneratedImageRow, GeneratedImageInsert>;
      generated_text: DatabaseTable<GeneratedTextRow, GeneratedTextInsert>;
      asset_requests: DatabaseTable<AssetRequestRow, AssetRequestInsert>;
      style_versions: DatabaseTable<StyleVersionRow, StyleVersionInsert>;
      characters: DatabaseTable<CharacterRecord, NewCharacterRecord>;
      image_generation_logs: DatabaseTable<Record<string, unknown>>;
    };
  };
}

export type SupabaseGeneratedImage = GeneratedImageRow | null;
export type SupabaseGeneratedText = GeneratedTextRow | null;
