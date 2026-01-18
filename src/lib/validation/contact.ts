import { z } from 'zod'

/**
 * Email regex that's more restrictive than the standard
 * to prevent abuse while allowing legitimate emails
 */
const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

/**
 * Name validation - allow letters, numbers, spaces, hyphens, apostrophes
 */
const nameRegex = /^[\p{L}\p{N}'\-\s]+$/u

/**
 * Enhanced contact form validation
 */
export const ContactSchema = z.object({
  name: z.string()
    .min(2, 'NAME_TOO_SHORT')
    .max(100, 'NAME_TOO_LONG')
    .regex(nameRegex, 'NAME_INVALID_CHARS')
    .transform(val => val.trim()),
  email: z.string()
    .min(1, 'EMAIL_REQUIRED')
    .max(255, 'EMAIL_TOO_LONG')
    .regex(emailRegex, 'EMAIL_INVALID')
    .transform(val => val.toLowerCase().trim()),
  subject: z.string()
    .min(5, 'SUBJECT_TOO_SHORT')
    .max(200, 'SUBJECT_TOO_LONG')
    .transform(val => val.trim()),
  message: z.string()
    .min(20, 'MESSAGE_TOO_SHORT')
    .max(5000, 'MESSAGE_TOO_LONG')
    .transform(val => val.trim()),
  honeypot: z.string()
    .max(0, 'HONEYPOT_FILLED')
    .optional(),
})

export type ContactRequest = z.infer<typeof ContactSchema>
