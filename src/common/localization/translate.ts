import { Translatable } from './localization-types';

/**
 * Converts a Translatable entity or an array of them into the public-facing entity
 * by unwrapping the translated strings from the first of the Translation entities.
 * Supports nested translations, including arrays of Translatable entities.
 */

// Overload signatures
export function translate<T>(translatable: Translatable<T>): T;
export function translate<T>(translatable: Translatable<T>[]): T[];
export function translate<T>(
  translatable: Translatable<T> | Translatable<T>[],
): T | T[] {
  if (Array.isArray(translatable)) {
    // If it's an array, recursively translate each item
    return translatable.map((item) => translate(item));
  }

  const translation = translatable.translations[0];

  const translated: any = { ...(translatable as any) };
  delete translated.translations;

  for (const [key, value] of Object.entries(translation)) {
    if (key !== 'languageCode' && key !== 'id') {
      translated[key] = value;
    }
  }

  for (const [key, value] of Object.entries(translated)) {
    if (Array.isArray(value)) {
      // If the property is an array, recursively translate each item
      translated[key] = value.map((item) =>
        item && typeof item === 'object' && 'translations' in item
          ? translate(item as Translatable<any>)
          : item,
      );
    } else if (value && typeof value === 'object' && 'translations' in value) {
      // If the property is a Translatable object, translate it
      translated[key] = translate(value as Translatable<any>);
    }
  }

  return translated;
}
