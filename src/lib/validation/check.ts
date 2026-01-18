import { z } from 'zod'

export const CheckQuerySchema = z.object({
  url: z.string().min(1, 'URL_REQUIRED'),
})

export type CheckQuery = z.infer<typeof CheckQuerySchema>
