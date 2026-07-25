"use client"

import * as React from "react"
import DOMPurify from "isomorphic-dompurify"

interface RichTextRendererProps {
  content: string | null
  className?: string
}

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = React.useState("")

  React.useEffect(() => {
    if (content) {
      const clean = DOMPurify.sanitize(content, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target'],
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSanitizedHtml(clean)
    }
  }, [content])

  if (!content) return null

  return (
    <div 
      className={`prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
