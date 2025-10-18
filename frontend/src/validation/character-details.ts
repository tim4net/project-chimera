import { z } from "zod";

export const jsonRecord = z.object({}).catchall(z.unknown());

export const characterDetailsSchema = z.object({
  description: z.string().trim().min(0).nullable().optional(),
  backstory: z.string().trim().min(0).nullable().optional(),
  personality_traits: z.array(z.string().trim()).nullable().optional(),
  ideals: z.array(z.string().trim()).nullable().optional(),
  bonds: z.array(z.string().trim()).nullable().optional(),
  flaws: z.array(z.string().trim()).nullable().optional(),
  alignment: z.string().trim().min(0).nullable().optional(),
  proficiencies: jsonRecord.nullable().optional(),
  spells: jsonRecord.nullable().optional(),
  avatar_url: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
});

export type CharacterDetailsInput = z.infer<typeof characterDetailsSchema>;
