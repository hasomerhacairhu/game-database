/**
 * Validation rules for forms
 * Compatible with Vuetify's validation system
 */

export type ValidationRule = (value: any) => boolean | string

/**
 * Common validation rules
 */
export const validationRules = {
  /**
   * Required field validation
   */
  required: (v: any): boolean | string => {
    if (Array.isArray(v)) {
      return v.length > 0 || 'Ez a mező kötelező'
    }
    return !!v || 'Ez a mező kötelező'
  },
  
  /**
   * Email format validation
   */
  email: (v: string): boolean | string => {
    if (!v) return true // Optional field
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Érvénytelen email cím'
  },
  
  /**
   * Maximum length validation
   * @param max - Maximum allowed length
   */
  maxLength: (max: number): ValidationRule => {
    return (v: string): boolean | string => {
      if (!v) return true // Optional field
      return v.length <= max || `Maximum ${max} karakter`
    }
  },
  
  /**
   * Minimum length validation
   * @param min - Minimum required length
   */
  minLength: (min: number): ValidationRule => {
    return (v: string): boolean | string => {
      if (!v) return true // Optional field
      return v.length >= min || `Minimum ${min} karakter`
    }
  },
  
  /**
   * Numeric value validation
   */
  numeric: (v: string): boolean | string => {
    if (!v) return true // Optional field
    return !isNaN(Number(v)) || 'Csak számokat adj meg'
  },
  
  /**
   * Integer value validation
   */
  integer: (v: string): boolean | string => {
    if (!v) return true // Optional field
    return Number.isInteger(Number(v)) || 'Csak egész számokat adj meg'
  },
  
  /**
   * Minimum value validation
   * @param min - Minimum allowed value
   */
  minValue: (min: number): ValidationRule => {
    return (v: number): boolean | string => {
      if (v === null || v === undefined) return true // Optional field
      return v >= min || `Minimum érték: ${min}`
    }
  },
  
  /**
   * Maximum value validation
   * @param max - Maximum allowed value
   */
  maxValue: (max: number): ValidationRule => {
    return (v: number): boolean | string => {
      if (v === null || v === undefined) return true // Optional field
      return v <= max || `Maximum érték: ${max}`
    }
  },
  
  /**
   * URL format validation
   */
  url: (v: string): boolean | string => {
    if (!v) return true // Optional field
    try {
      new URL(v)
      return true
    } catch {
      return 'Érvénytelen URL'
    }
  },
  
  /**
   * Date validation (YYYY-MM-DD format)
   */
  date: (v: string): boolean | string => {
    if (!v) return true // Optional field
    const pattern = /^\d{4}-\d{2}-\d{2}$/
    if (!pattern.test(v)) {
      return 'Érvénytelen dátum formátum (ÉÉÉÉ-HH-NN)'
    }
    const date = new Date(v)
    return !isNaN(date.getTime()) || 'Érvénytelen dátum'
  },
  
  /**
   * Password strength validation
   */
  password: (v: string): boolean | string => {
    if (!v) return true // Optional field
    if (v.length < 6) {
      return 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
    }
    return true
  },
  
  /**
   * Password confirmation validation
   * @param password - The original password to compare with
   */
  passwordConfirmation: (password: string): ValidationRule => {
    return (v: string): boolean | string => {
      return v === password || 'A jelszavak nem egyeznek'
    }
  },
}

/**
 * Combines multiple validation rules
 * @param rules - Array of validation rules
 * @returns Combined validation rule
 */
export function combineRules(...rules: ValidationRule[]): ValidationRule {
  return (value: any): boolean | string => {
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }
}
