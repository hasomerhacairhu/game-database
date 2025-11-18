/**
 * Formatting utilities for dates, text, and numbers
 */

import { Timestamp } from 'firebase/firestore'

/**
 * Formats a date to a readable string
 * @param date - Date to format (Date, Timestamp, or string)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | Timestamp | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return ''
  
  let dateObj: Date
  
  // Convert to Date object
  if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return ''
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return ''
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('hu-HU', defaultOptions).format(dateObj)
}

/**
 * Formats a date to short format (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateShort(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return ''
  
  let dateObj: Date
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return ''
  }
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formats a date to relative time (e.g., "2 napja", "5 hónapja")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return ''
  
  let dateObj: Date
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return ''
  }
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }
  
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) {
    return 'Most'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} perce`
  } else if (diffHours < 24) {
    return `${diffHours} órája`
  } else if (diffDays < 30) {
    return `${diffDays} napja`
  } else if (diffMonths < 12) {
    return `${diffMonths} hónapja`
  } else {
    return `${diffYears} éve`
  }
}

/**
 * Truncates text to a maximum length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis character(s) to add
 * @returns Truncated text
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Capitalizes the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Converts text to title case
 * @param text - Text to convert
 * @returns Title case text
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'hu-HU')
 * @returns Formatted number string
 */
export function formatNumber(num: number | null | undefined, locale: string = 'hu-HU'): string {
  if (num === null || num === undefined) return ''
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Pluralizes a word based on count
 * @param count - Count to check
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns Appropriate form with count
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
