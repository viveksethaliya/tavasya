# RichTextRenderer — UI/UX & Technical Review

## Scope & Constraints

This is the **display-only** component that renders sanitized blog `content` HTML wherever it's used (e.g. the public post page and/or preview surfaces) — it's the read side, distinct from `rich-text-editor.tsx` (the write side).

**Contract that must not change:**
- Props stay exactly as they are: `content: string | null`, `className?: string`.
- Sanitization must only get **stronger**, never weaker — nothing currently allowed through `DOMPurify` should be blocked as a side effect of these changes.
- Stays built on Tailwind Typography (`prose`) classes — not replaced with hand-rolled CSS.
- `dark:prose-invert` dark-mode support is preserved exactly.

---

## Findings

### 1. Sanitization runs in a `useEffect`, causing a content flash — **High**
`sanitizedHtml` starts as `""` and is only populated after the effect fires post-mount, so on every render the wrapper `div` paints with empty content for at least one frame before the real content pops in. `DOMPurify.sanitize` is synchronous — it doesn't need an effect at all. Telling detail: the code already has `// eslint-disable-next-line react-hooks/set-state-in-effect` suppressing a lint rule that exists specifically to flag this pattern.

**Fix:** compute the sanitized HTML with `useMemo(() => DOMPurify.sanitize(content, {...}), [content])` directly in the render body instead of `useState` + `useEffect`. Same output, same security behavior, no flash, one less render.

### 2. `target="_blank"` links have no `rel` enforcement — **High (security + UX)**
`ADD_ATTR: ['target']` lets the `target` attribute through sanitization, but nothing adds or preserves `rel="noopener noreferrer"`. A link that opens in a new tab without `rel="noopener"` lets the destination page access `window.opener` and potentially redirect the original tab — a known phishing vector (reverse tabnabbing), and it means any external link an author pastes into a post silently carries this risk for readers.

**Fix:** add a DOMPurify `afterSanitizeAttributes` hook that forces `rel="noopener noreferrer"` onto any element with `target="_blank"`. Pure hardening — doesn't change what authors can do, only makes the resulting links safer for readers.

### 3. `max-w-none` removes Tailwind Typography's built-in readable line length — **Medium (verify first)**
The `prose` plugin defaults to a ~65-character max width specifically because very long lines are harder to read. `max-w-none` overrides that, so if the parent container doesn't already constrain width, body text can stretch edge-to-edge on wide viewports.

**Needs verification, not a blind fix:** if wherever this renders already wraps it in a constrained container (the way the admin Preview modal does, for example), `max-w-none` is correct and intentional — it avoids double-constraining. If it renders somewhere unconstrained (e.g. directly on a full-width public post page), it needs an explicit cap like `max-w-3xl`. Check every place this component is used before changing this.

### 4. Typography palette mismatch: `prose-stone` vs. the project's `slate` system — **Medium (verify first)**
Every other page in this project (list, edit, sidebar cards) uses the `slate` neutral scale plus `#324E64`/`#F3BA43`. `prose-stone` pulls in a warm-gray neutral palette for body copy, which reads slightly differently from the cool slate-gray used everywhere else.

**Needs verification, not a blind fix:** if this renderer is only ever placed on a genuinely separate, non-admin page with its own distinct brand palette, `prose-stone` may be intentional. If it appears anywhere inside the admin surfaces we've been redesigning, switch to `prose-slate` for consistency.

### 5. No distinction between "nothing written yet" and "something went wrong upstream" — **Low**
Returning `null` for any falsy `content` is reasonable for a genuinely empty post. Only worth revisiting if this component is ever used somewhere blank space would read as a bug rather than "empty on purpose" (e.g. inside the admin Preview modal). Not urgent — flagging for completeness, not recommending action.

---

## Priority Summary

| # | Finding | Priority | Action |
|---|---|---|---|
| 1 | `useEffect` sanitization flash | High | Fix directly — switch to `useMemo` |
| 2 | Missing `rel="noopener noreferrer"` on `target="_blank"` | High | Fix directly — add DOMPurify hook |
| 3 | `max-w-none` reading width | Medium | Verify usage sites first, then decide |
| 4 | `prose-stone` vs `prose-slate` | Medium | Verify usage sites first, then decide |
| 5 | Empty vs. error state | Low | No action unless context changes |