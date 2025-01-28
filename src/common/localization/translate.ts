import { Translatable } from './localization-types';

/**
 * Converts a Translatable entity into the public-facing entity by unwrapping
 * the translated strings from the first of the Translation entities.
 * Supports nested translations.
 */
export function translate<T>(translatable: Translatable<T>): T {
  const translation = translatable.translations[0];

  const translated: any = { ...(translatable as any) };
  delete translated.translations;

  for (const [key, value] of Object.entries(translation)) {
    if (key !== 'languageCode' && key !== 'id') {
      translated[key] = value;
    }
  }

  for (const [key, value] of Object.entries(translated)) {
    // Check if a property is also a Translatable and recursively translate it
    if (value && typeof value === 'object' && 'translations' in value) {
      translated[key] = translate(value as Translatable<any>);
    }
  }

  return translated;
}