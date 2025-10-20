# Gemini Model Selection API

## Overview

The `backend/src/services/gemini.ts` module now provides an improved, intuitive model selection API with support for multiple Gemini model types.

## Model Types

The following model types are supported via the `GeminiModelType` type:

- **`'pro'`** - High-quality, comprehensive responses (default for important tasks)
- **`'flash'`** - Fast, cost-effective responses (default for routine tasks)
- **`'image'`** - Image generation models (Imagen 3.0)
- **`'image-flash'`** - Fast image generation models

## API Functions

### `getModel(modelType?: GeminiModelType): Promise<GenerativeModel>`

Returns a Gemini model instance configured for the specified model type.

**Parameters:**
- `modelType` (optional) - One of: `'pro'`, `'flash'`, `'image'`, `'image-flash'`
- Default: `'pro'`

**Examples:**
```typescript
import { getModel } from './services/gemini';

// Get pro model (high quality)
const proModel = await getModel('pro');

// Get flash model (fast, cost-effective)
const flashModel = await getModel('flash');

// Get image generation model
const imageModel = await getModel('image');
```

### `generateOnboardingScene(character: CharacterSummary): Promise<string>`

Generates a personalized onboarding scene for a new character.

**Uses:** `'pro'` model (high-quality narrative for important first impression)

### `generateText(prompt: string, options?: {...}): Promise<string>`

General-purpose text generation with configurable model selection.

**Parameters:**
- `prompt` - The text prompt
- `options.temperature` - Creativity level (0-1, default: 0.8)
- `options.maxTokens` - Maximum output length (default: 200)
- `options.modelType` - Model to use (default: `'flash'`)

**Examples:**
```typescript
// Quick text generation (uses flash by default)
const quickText = await generateText('Generate a tavern name');

// High-quality text generation
const qualityText = await generateText('Write a detailed quest description', {
  modelType: 'pro',
  maxTokens: 500
});
```

### `getDmResponse(character, history, playerMessage): Promise<ParsedDmResponse>`

Generates AI Dungeon Master responses with game state updates.

**Uses:** `'flash'` model (optimized for frequent, cost-effective DM interactions)

## Model Selection Strategy

The module automatically:

1. **Enumerates available models** from the Gemini API on first use
2. **Caches the best model** for each type
3. **Falls back gracefully** to known-working model names if enumeration fails

### Fallback Models

- `'pro'` → `gemini-1.5-pro`
- `'flash'` → `gemini-1.5-flash`
- `'image'` → `imagen-3.0-generate-001`
- `'image-flash'` → `imagen-3.0-fast-generate-001`

## Cost Optimization

The API is designed with cost optimization in mind:

- **Frequent operations** (DM responses, routine text) use `'flash'` models
- **Important operations** (onboarding, major story events) use `'pro'` models
- **Image generation** can choose between quality (`'image'`) and speed (`'image-flash'`)

## Usage Guidelines

### When to use `'pro'`:
- Character onboarding scenes
- Major story arc generation
- Complex world-building content
- Critical narrative moments

### When to use `'flash'`:
- Routine DM responses
- Quick name generation
- Frequent NPC dialogue
- Travel narration
- Minor quest descriptions

### When to use `'image'` or `'image-flash'`:
- Character portraits
- Location illustrations
- Item visualizations
- Map elements

## Example: Custom Service

```typescript
import { getModel, type GeminiModelType } from './services/gemini';

async function generateQuestDescription(
  complexity: 'simple' | 'epic'
): Promise<string> {
  // Use appropriate model based on quest importance
  const modelType: GeminiModelType = complexity === 'epic' ? 'pro' : 'flash';

  const model = await getModel(modelType);
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: `Generate a ${complexity} quest...` }]
    }]
  });

  return result.response.text();
}
```

## Migration from Old API

**Before:**
```typescript
const model = await getModel(true);  // boolean parameter unclear
const model = await getModel(false); // what does false mean?
```

**After:**
```typescript
const model = await getModel('flash'); // clear intent
const model = await getModel('pro');   // clear intent
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import { getModel, type GeminiModelType } from './services/gemini';

const modelType: GeminiModelType = 'flash'; // Autocomplete + type safety
const model = await getModel(modelType);
```
