"use client"

import * as React from "react"
import DOMPurify from "isomorphic-dompurify"

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

interface RichTextRendererProps {
  content: string | null
  className?: string
}

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  const sanitizedHtml = React.useMemo(() => {
    if (!content) return ""
    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
    })
  }, [content])

  if (!content) return null

  return (
    <div 
      // prose-stone deferred pending actual public blog page design
      className={`prose prose-stone dark:prose-invert prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
