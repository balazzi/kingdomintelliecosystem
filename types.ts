
export enum Language {
  ENGLISH = 'en',
  FRENCH = 'fr',
  SPANISH = 'es',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  CHINESE = 'zh',
  EWE = 'ee'
}

export interface Scripture {
  reference: string;
  text: string;
  category: string;
}

export interface PrayerResponse {
  message: string;
  scripture: Scripture;
  prayer: string;
}

export interface Devotional {
  title: string;
  content: string;
  scripture: string;
  application: string;
  prayer: string;
}

export type View = 'home' | 'daily-bread' | 'prayer' | 'study' | 'media' | 'donate' | 'assistant' | 'deliverance' | 'healing' | 'contact';
