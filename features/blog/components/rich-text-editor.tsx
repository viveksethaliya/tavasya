"use client"

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'
import { Button } from '@/components/ui/button'
import { 
  RiBold, 
  RiItalic, 
  RiStrikethrough, 
  RiH2, 
  RiH3, 
  RiListUnordered, 
  RiListOrdered, 
  RiDoubleQuotesL,
  RiImageAddLine,
  RiTableLine,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiDeleteColumn,
  RiInsertRowTop,
  RiInsertRowBottom,
  RiDeleteRow,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiFullscreenLine,
  RiFullscreenExitLine
} from '@remixicon/react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

interface MenuBarProps {
  editor: any
  orientation?: 'horizontal' | 'vertical'
  isFocusMode?: boolean
  toggleFocusMode?: () => void
}

const MenuBar = ({ editor, orientation = 'horizontal', isFocusMode, toggleFocusMode }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className={`bg-transparent flex ${orientation === 'vertical' ? 'flex-col py-4 w-full min-h-full [&>button]:shrink-0' : 'flex-wrap items-center justify-center sm:justify-start'} gap-1`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
        title="Bold (Cmd/Ctrl+B)"
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
        aria-pressed={editor.isActive('italic')}
        title="Italic (Cmd/Ctrl+I)"
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
        aria-pressed={editor.isActive('strike')}
        title="Strikethrough (Cmd/Ctrl+Shift+X)"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-muted' : ''}
      >
        <RiStrikethrough className="h-4 w-4" />
      </Button>
      <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0' : 'w-px h-8 bg-border mx-1 shrink-0'} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Heading 2"
        aria-pressed={editor.isActive('heading', { level: 2 })}
        title="Heading 2 (Cmd/Ctrl+Option+2)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <RiH2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Heading 3"
        aria-pressed={editor.isActive('heading', { level: 3 })}
        title="Heading 3 (Cmd/Ctrl+Option+3)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
      >
        <RiH3 className="h-4 w-4" />
      </Button>
      <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0' : 'w-px h-8 bg-border mx-1 shrink-0'} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bullet list"
        aria-pressed={editor.isActive('bulletList')}
        title="Bullet List (Cmd/Ctrl+Shift+8)"
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
        aria-pressed={editor.isActive('orderedList')}
        title="Ordered List (Cmd/Ctrl+Shift+7)"
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
        aria-pressed={editor.isActive('blockquote')}
        title="Blockquote (Cmd/Ctrl+Shift+B)"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
      >
        <RiDoubleQuotesL className="h-4 w-4" />
      </Button>
      <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0' : 'w-px h-8 bg-border mx-1 shrink-0'} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Undo"
        title="Undo (Cmd/Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <RiArrowGoBackLine className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Redo"
        title="Redo (Cmd/Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <RiArrowGoForwardLine className="h-4 w-4" />
      </Button>
      <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0' : 'w-px h-8 bg-border mx-1 shrink-0'} />
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
            title="Insert Image"
            className="hover:bg-muted"
          >
            <RiImageAddLine className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Table"
        title={editor.isActive('table') ? "Delete Table" : "Insert Table (3x3)"}
        onClick={() => {
          if (editor.isActive('table')) {
            editor.chain().focus().deleteTable().run()
          } else {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        }}
        className={editor.isActive('table') ? 'bg-muted' : ''}
      >
        <RiTableLine className="h-4 w-4" />
      </Button>
      
      {editor.isActive('table') && (
        <>
          <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0 hidden sm:block' : 'w-px h-8 bg-border mx-1 shrink-0 hidden sm:block'} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add Column Before"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <RiInsertColumnLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add Column After"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <RiInsertColumnRight className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Delete Column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <RiDeleteColumn className="h-4 w-4 text-red-500" />
          </Button>
          <div className={orientation === 'vertical' ? 'h-px w-8 bg-border my-1 shrink-0 hidden sm:block' : 'w-px h-8 bg-border mx-1 shrink-0 hidden sm:block'} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add Row Above"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <RiInsertRowTop className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add Row Below"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <RiInsertRowBottom className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Delete Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <RiDeleteRow className="h-4 w-4 text-red-500" />
          </Button>
        </>
      )}
      
      <div className={orientation === 'vertical' ? 'flex-1' : ''} />
      {toggleFocusMode && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          title={isFocusMode ? "Exit Focus Mode (Esc)" : "Focus Mode"}
          onClick={toggleFocusMode}
        >
          {isFocusMode ? <RiFullscreenExitLine className="h-5 w-5 text-slate-600" /> : <RiFullscreenLine className="h-5 w-5 text-slate-600" />}
        </Button>
      )}
    </div>
  )
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isFocusMode, setIsFocusMode] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode])

  React.useEffect(() => {
    if (isFocusMode) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isFocusMode])

  const toggleFocusMode = React.useCallback(() => {
    setIsFocusMode(prev => !prev)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl shadow-sm w-full h-auto my-10 object-cover',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-slate lg:prose-lg mx-auto prose-headings:text-[#324E64] prose-a:text-[#F3BA43] focus:outline-none min-h-[700px] w-full p-8 sm:p-12 bg-white',
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

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-100 flex overflow-hidden">
        <div className="w-16 sm:w-20 bg-white border-r border-slate-200 shadow-sm flex flex-col shrink-0 overflow-y-auto">
          <MenuBar editor={editor} orientation="vertical" isFocusMode={isFocusMode} toggleFocusMode={toggleFocusMode} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-12 lg:p-24 scroll-smooth">
          <div className="max-w-4xl mx-auto shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5 bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-10 shadow-sm">
        <MenuBar editor={editor} orientation="horizontal" isFocusMode={isFocusMode} toggleFocusMode={toggleFocusMode} />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
