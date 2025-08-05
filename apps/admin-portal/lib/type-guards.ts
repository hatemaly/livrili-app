// Type guard utilities for the admin portal

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj
}

export function assertString(value: unknown, fallback: string = ''): string {
  return isString(value) ? value : fallback
}

export function assertNumber(value: unknown, fallback: number = 0): number {
  return isNumber(value) ? value : fallback
}

// Analytics-specific type guards
export interface SafeMetric {
  value: number
  trend?: number
  label: string
  formatted?: string
}

export function createSafeMetric(
  value: unknown,
  trend: unknown = undefined,
  label: string = '',
  formatted?: unknown
): SafeMetric {
  return {
    value: assertNumber(value),
    trend: trend !== undefined ? assertNumber(trend) : undefined,
    label: assertString(label),
    formatted: formatted ? assertString(formatted) : undefined,
  }
}

export function createSafeArray<T>(
  value: unknown,
  fallback: T[] = []
): T[] {
  return isArray<T>(value) ? value : fallback
}