/**
 * Normalizes skin types by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Removing duplicates
 * - Filtering out empty strings
 */
export const normalizeSkinTypes = (skinTypes: string | string[]): string[] => {
  const types = Array.isArray(skinTypes) 
    ? skinTypes 
    : skinTypes.split(',').map(s => s.trim())
  
  return Array.from(
    new Set(
      types
        .map(type => type.toLowerCase().trim())
        .filter(Boolean)
    )
  )
}

/**
 * Valid skin types (only 4 allowed)
 */
export const VALID_SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive'] as const

export type SkinType = typeof VALID_SKIN_TYPES[number]

/**
 * Validates and normalizes skin types, only keeping valid ones
 */
export const validateAndNormalizeSkinTypes = (skinTypes: string | string[]): string[] => {
  const normalized = normalizeSkinTypes(skinTypes)
  return normalized.filter(type => VALID_SKIN_TYPES.includes(type as SkinType))
}
