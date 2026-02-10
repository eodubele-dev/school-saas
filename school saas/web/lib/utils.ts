import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Standardized date formatter to prevent hydration mismatches between server and client.
 * Uses en-GB locale for consistent DD/MM/YYYY formatting.
 */
export function formatDate(date: string | number | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}


export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Safely parse JSON from a fetch Response object.
 * Prevents "Unexpected end of JSON input" errors during stream failures.
 */
export async function safeParseJSON(response: Response) {
  const text = await response.text()
  if (!text) return { message: 'Empty response body' }
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('[safeParseJSON] Failed to parse:', text.substring(0, 100))
    return { message: 'Invalid JSON response', raw: text }
  }
}
