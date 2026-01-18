import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  honeypot: z.string().max(0).optional(),
})

export type ContactRequest = z.infer<typeof ContactSchema>
