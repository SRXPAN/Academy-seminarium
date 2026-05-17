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

export type Role = 'ADMIN' | 'EDITOR' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
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

export type Lang = 'UA' | 'PL' | 'EN'

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

export function getTranslation(
  json: TranslationJson | PartialTranslationJson | null | undefined,
  lang: Lang,
  fallback: string = ''
): string {
  if (!json) return fallback
  return json[lang] ?? json['EN'] ?? fallback
}

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
