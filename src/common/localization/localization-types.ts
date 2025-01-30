export enum Language {
  en = 'en',
  ru = 'ru',
  ua = 'ua',
  ku = 'ku',
}

/**
 * This type should be used in any interfaces where the value is to be
 * localized into different languages.
 */
export type LocaleString = string & { _opaqueType: 'LocaleString' };

export type TranslatableKeys<T> = {
  [K in keyof T]: T[K] extends LocaleString ? K : never;
}[keyof T];

export type NonTranslateableKeys<T> = {
  [K in keyof T]: T[K] extends LocaleString ? never : K;
}[keyof T];

/**
 * Entities which have localizable string properties should implement this type.
 */
export type Translatable<T> = {
  [K in NonTranslateableKeys<T>]: T[K];
} & {
  [K in TranslatableKeys<T>]?: never;
} & { translations: Translation<T>[] };

/**
 * Translations of localizable entities should implement this type.
 */
export type Translation<T> = {
  languageCode: string;
  base: Translatable<T>;
} & { [K in TranslatableKeys<T>]: string };
