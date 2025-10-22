/**
 * @file Centralized JSON Parsing Utility
 * @description Handles robust JSON extraction and parsing from LLM responses
 * Applies common fixes for LLM-generated JSON artifacts
 */

export interface ParseOptions {
  /** Allow and fix common JSON errors like trailing commas (default: true) */
  fixCommonErrors?: boolean;
  /** Log debug information (default: false) */
  debug?: boolean;
  /** Expected type for validation (optional) */
  expectedType?: string;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'direct' | 'extracted' | 'fallback';
  raw: string;
}

/**
 * Safely parse JSON from LLM response with automatic cleanup
 *
 * Handles:
 * - JSON wrapped in markdown code blocks (```json ... ```)
 * - JSON mixed with narrative text
 * - Common JSON errors: trailing commas, smart quotes, Unicode spaces
 * - Chinese characters and other artifacts
 *
 * @example
 * const response = 'Here is your JSON: ```json\n{"name": "Test",}\n```';
 * const result = parseJsonFromResponse<MyType>(response);
 * if (result.success) {
 *   console.log(result.data); // Properly parsed object
 * }
 */
export function parseJsonFromResponse<T = unknown>(
  response: string,
  options: ParseOptions = {}
): ParseResult<T> {
  const { fixCommonErrors = true, debug = false, expectedType } = options;

  const log = debug ? console.log : () => {};

  try {
    // Step 1: Try to extract JSON from code blocks first
    let jsonStr = extractFromCodeBlock(response);

    // Step 2: If no code block, extract JSON object from mixed text
    if (!jsonStr) {
      jsonStr = extractJsonObject(response);
    }

    if (!jsonStr) {
      return {
        success: false,
        error: 'No JSON object found in response',
        source: 'direct',
        raw: response,
      };
    }

    log(`[JsonParser] Extracted JSON: ${jsonStr.substring(0, 100)}...`);

    // Step 3: Clean up common LLM artifacts
    if (fixCommonErrors) {
      jsonStr = cleanJsonString(jsonStr);
    }

    // Step 4: Parse the JSON
    let data: T;
    try {
      data = JSON.parse(jsonStr) as T;
    } catch (parseError) {
      // Try one more aggressive cleanup pass
      if (fixCommonErrors) {
        jsonStr = aggressiveClean(jsonStr);
        log(`[JsonParser] After aggressive clean: ${jsonStr.substring(0, 100)}...`);
        data = JSON.parse(jsonStr) as T;
      } else {
        throw parseError;
      }
    }

    log(`[JsonParser] ✅ Successfully parsed JSON`);
    return {
      success: true,
      data,
      source: 'extracted',
      raw: response,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`[JsonParser] ❌ Parse error: ${errorMsg}`);

    return {
      success: false,
      error: errorMsg,
      source: 'direct',
      raw: response,
    };
  }
}

/**
 * Extract JSON from ```json ... ``` code blocks
 */
function extractFromCodeBlock(text: string): string | null {
  const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonCodeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Extract JSON object from mixed text using brace-aware matching
 * Properly handles nested braces and strings with escaped quotes
 */
function extractBalancedJsonObject(text: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Handle string state
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    // Track string entries
    if (char === '"') {
      inString = true;
      continue;
    }

    // Track brace depth
    if (char === '{') {
      if (start === -1) start = i;
      depth++;
    } else if (char === '}') {
      depth--;
      if (start !== -1 && depth === 0) {
        return text.substring(start, i + 1);
      }
    }
  }

  return null;
}

/**
 * Extract JSON object from mixed text by finding { and }
 * Falls back to simple extraction if balanced extraction fails
 */
function extractJsonObject(text: string): string | null {
  // Try brace-aware extraction first
  const balanced = extractBalancedJsonObject(text);
  if (balanced) return balanced;

  // Fall back to simple extraction
  const openBrace = text.indexOf('{');
  const closeBrace = text.lastIndexOf('}');

  if (openBrace === -1 || closeBrace === -1 || closeBrace <= openBrace) {
    return null;
  }

  return text.substring(openBrace, closeBrace + 1);
}

/**
 * Clean up common LLM-generated JSON artifacts
 */
function cleanJsonString(json: string): string {
  return json
    // Remove Chinese characters
    .replace(/[\u4e00-\u9fa5]/g, '')
    // Remove ideographic spaces
    .replace(/[\u3000]/g, ' ')
    // Fix smart quotes - PRESERVE ASCII apostrophes, only convert curly quotes
    .replace(/[\u201c\u201d]/g, '"') // Curly double quotes to straight double quote
    .replace(/[\u2018\u2019]/g, "'") // Curly single quotes to straight single quote
    .replace(/[\u2032\u2033]/g, '"') // Prime marks to double quote
    // Fix other Unicode quote characters
    .replace(/[«»]/g, '"')
    // Remove unnecessary spaces around colons and commas
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    // Remove trailing commas (before } or ])
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Aggressive cleanup for difficult JSON responses
 * Use only as last resort
 */
function aggressiveClean(json: string): string {
  let result = json;

  // Remove any HTML entities
  result = result
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Remove comments (// and /* */)
  result = result
    .replace(/\/\/.*?$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Fix common newline issues
  result = result
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\n/g, '\\n')
    .replace(/\\t/g, '\\t');

  // Remove control characters
  result = result.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

  // Final cleanup
  result = cleanJsonString(result);

  return result;
}

/**
 * Validate JSON structure matches expected fields
 */
export function validateJsonStructure<T>(
  data: unknown,
  expectedFields: (keyof T)[],
  partialMatch = false
): data is T {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (partialMatch) {
    // Check that at least some expected fields exist
    return expectedFields.some((field) => field in obj);
  }

  // Check that all expected fields exist
  return expectedFields.every((field) => field in obj);
}

/**
 * Sanitize a string field to remove JSON-breaking characters
 */
export function sanitizeStringField(text: string): string {
  return text
    // Remove quotes and escape them
    .replace(/"/g, '\\"')
    // Remove newlines and convert to spaces
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    // Remove tabs
    .replace(/\t/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1f]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Batch parse multiple JSON objects from response
 * Useful for responses with multiple items
 */
export function parseJsonArray<T>(
  response: string,
  options: ParseOptions = {}
): ParseResult<T[]> {
  const { debug = false } = options;
  const log = debug ? console.log : () => {};

  try {
    // Try to extract array from brackets
    const openBracket = response.indexOf('[');
    const closeBracket = response.lastIndexOf(']');

    if (openBracket === -1 || closeBracket === -1 || closeBracket <= openBracket) {
      return {
        success: false,
        error: 'No JSON array found in response',
        source: 'direct',
        raw: response,
      };
    }

    let arrayStr = response.substring(openBracket, closeBracket + 1);
    arrayStr = cleanJsonString(arrayStr);

    const data = JSON.parse(arrayStr) as T[];
    log(`[JsonParser] ✅ Parsed array with ${data.length} items`);

    return {
      success: true,
      data,
      source: 'extracted',
      raw: response,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`[JsonParser] ❌ Array parse error: ${errorMsg}`);

    return {
      success: false,
      error: errorMsg,
      source: 'direct',
      raw: response,
    };
  }
}

/**
 * Compare parsed JSON quality
 * Returns which strategy worked best
 */
export function selectBestParse<T>(
  attempts: ParseResult<T>[],
  debug = false
): ParseResult<T> {
  const log = debug ? console.log : () => {};

  const successful = attempts.filter((a) => a.success);

  if (successful.length === 0) {
    log('[JsonParser] No successful parses');
    return attempts[attempts.length - 1] || {
      success: false,
      error: 'No parse attempts',
      source: 'direct',
      raw: '',
    };
  }

  // Prefer 'extracted' source over 'fallback'
  const best = successful.sort((a, b) => {
    const sourceOrder = { extracted: 0, direct: 1, fallback: 2 };
    return (
      (sourceOrder[a.source] || 999) - (sourceOrder[b.source] || 999)
    );
  })[0];

  log(`[JsonParser] Selected best parse from source: ${best.source}`);
  return best;
}
