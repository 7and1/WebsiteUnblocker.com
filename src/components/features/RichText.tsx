'use client'

import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichText({ data }: { data?: SerializedEditorState | null }) {
  if (!data) return null
  return <PayloadRichText data={data} />
}
