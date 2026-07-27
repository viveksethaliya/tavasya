"use client"

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'
import { Button } from '@/components/ui/button'
import { 
  RiBold, 
  RiItalic, 
  RiStrikethrough, 
  RiH1, 
  RiH2, 
  RiListUnordered, 
  RiListOrdered, 
  RiDoubleQuotesL,
  RiImageAddLine
} from '@remixicon/react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border border-input bg-transparent p-1 rounded-t-md flex flex-wrap gap-1 border-b-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <RiBold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <RiItalic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-muted' : ''}
      >
        <RiStrikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
      >
        <RiH1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <RiH2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <RiListUnordered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
      >
        <RiListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
      >
        <RiDoubleQuotesL className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <MediaPickerModal
        onChange={(id, item) => {
          if (item?.file_url) {
            editor.chain().focus().setImage({ src: item.file_url, alt: item.alt_text ?? item.file_name }).run()
          }
        }}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Insert image"
            className="hover:bg-muted"
          >
            <RiImageAddLine className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  )
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md shadow-sm max-w-full h-auto my-4',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[500px] max-w-none p-4 border border-input rounded-b-md',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync value if it changes externally (e.g. form reset)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className="flex flex-col w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
