// packages/shared/src/types/index.ts

// ============================================
// LOCALIZATION HELPER TYPES
// ============================================

export interface LocalizedString {
  UA?: string
  PL?: string
  EN?: string
}

export interface LocalizedObject {
  UA: string
  PL: string
  EN: string
}

// ============================================
// USER & AUTH TYPES
// ============================================

export type Role = 'ADMIN' | 'EDITOR' | 'INSTRUCTOR' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  xp: number
  avatar?: string | null
}

export interface AuthUser extends User {}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
}


export interface Material {
  id: string
  title: string
  titleJson?: LocalizedString
  type: MaterialType
  url?: string
  fileId?: string
  content?: string
  contentJson?: LocalizedString
  lang?: Lang
  status?: Status
  tags?: string[]
}

export type MaterialType = 'VIDEO' | 'ARTICLE' | 'PDF' | 'OTHER'

export type Lang = 'UA' | 'PL' | 'EN'
export type Category = 'PROGRAMMING' | 'DESIGN' | 'MARKETING' | 'BUSINESS' | 'LANGUAGE' | 'OTHER'
export type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

// ============================================
// ACTIVITY TYPES
// ============================================

export interface ActivityLog {
  date: string // YYYY-MM-DD
  timeSpent: number // seconds
  quizAttempts: number
  materialsViewed: number
  goalsMet: number
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalTimeSpent: number
  last7DaysActivity: ActivityLog[]
  lastActiveDate: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiError {
  error: string
  details?: unknown
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

// ============================================
// TRANSLATION TYPES (for Prisma JSON fields)
// ============================================

export interface TranslationJson {
  UA: string
  PL: string
  EN: string
}

export type PartialTranslationJson = Partial<TranslationJson>

export interface WeakSpotTranslationJson {
  topic: TranslationJson
  advice: TranslationJson
}

export interface AchievementTranslationJson {
  name: TranslationJson
  description: TranslationJson
}

export function getTranslation(
  json: TranslationJson | PartialTranslationJson | null | undefined,
  lang: Lang,
  fallback: string = ''
): string {
  if (!json) return fallback
  return json[lang] ?? json['EN'] ?? fallback
}

// ============================================
// EDITOR TYPES
// ============================================

export interface EditorFile {
  id: string
  name: string
  content: string


// ============================================
// VALIDATION CONSTANTS
// ============================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  SLUG_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 50000,
  URL_MAX_LENGTH: 2000,
} as const

// ============================================
// SECURITY TYPES
// ============================================

export interface CsrfTokenResponse {
  csrfToken: string
}