-- Add game-time and calendar fields to characters table
-- Celestine Concordance Calendar: 8-day weeks, 10 months, 40 days per month, 400 days per year

ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS game_time_minutes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS world_date_day INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_month INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_year INT NOT NULL DEFAULT 0;

-- Add check constraints for valid calendar values
ALTER TABLE public.characters
ADD CONSTRAINT valid_world_date_day CHECK (world_date_day >= 1 AND world_date_day <= 40),
ADD CONSTRAINT valid_world_date_month CHECK (world_date_month >= 1 AND world_date_month <= 10),
ADD CONSTRAINT valid_world_date_year CHECK (world_date_year >= 0);

-- Create index for faster calendar queries
CREATE INDEX IF NOT EXISTS characters_world_date_idx ON public.characters (world_date_year, world_date_month, world_date_day);
