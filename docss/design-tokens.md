# Blog Admin UI Design Tokens

This document serves as a reference for the core design tokens and components used to construct the Blog Admin Redesign. Maintaining these consistent values ensures the UI feels premium, readable, and unified.

## Colors

### Brand & Primary
- **Primary Navy:** `#324E64`
  - *Usage:* Primary headings (`h1`, `h2`), solid button backgrounds (`bg-[#324E64] hover:bg-[#324E64]/90`), dialog titles.
- **Accent Gold/Yellow:** `#F3BA43`
  - *Usage:* Links in the prose editor, the primary "Publish Post" confirm button (`bg-[#F3BA43]`), subtle interactive hovers.

### Neutrals (Tailwind Slate)
- **Backgrounds:** `bg-slate-50` (Form surfaces, snippet backgrounds), `bg-white` (Cards, header, editor canvas).
- **Borders:** `border-slate-100` (Cards), `border-slate-200` (Input borders, dividers).
- **Text:** 
  - `text-slate-900` / `text-slate-800` (Strong paragraphs, card titles)
  - `text-slate-600` (Standard body text)
  - `text-slate-500` (Helper text, empty states, labels)
  - `text-slate-400` (Placeholders, subtle metadata like character counts)

### Status & Feedback
- **Success:** `text-emerald-600` / `bg-emerald-500`
- **Error:** `text-red-500` / `bg-red-500`
- **In-Progress:** `bg-blue-500` (Autosave indicator dot)

## Typography
- **Headings:** Bold (`font-bold`). The main title input uses `text-4xl sm:text-5xl font-bold`.
- **Card Titles:** `font-bold text-[#324E64]`
- **Body:** Standard Tailwind sans.
- **Micro-copy:** `text-xs text-slate-500`

## Shapes & Layout
- **Border Radius:** 
  - Cards & Editor Canvas: `rounded-2xl`
  - Buttons/Inputs: Default shadcn `rounded-md`
- **Shadows:** 
  - Subtle depth for cards: `shadow-sm`
  - Sticky header: `shadow-sm`
- **Spacing:**
  - Standard gap between sidebar cards: `space-y-4` or `space-y-6`
  - Card internal padding: `p-6`

## Motion
- **Entrance Animation:** For collapsible panels (like SEO configuration), use Tailwind animate-in:
  `animate-in fade-in slide-in-from-top-4 duration-300`
- **Micro-interactions:** Buttons should have hover transitions (e.g., `transition-colors`, `hover:bg-slate-100`).

## Components
- **Inputs:** Clean, with focus rings removed for the large Title input.
- **Badges:** Used for status indication (Draft = `secondary`, Published = `default`).
- **Drawers:** On mobile (`< sm`), sidebar content should move into a bottom sheet using the `Drawer` component to preserve screen real estate.
