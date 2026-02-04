
# Fix Floating Chatbot & Study Tools Overlap + Preview Caching

## Overview
This plan addresses two issues:
1. **Lovable preview not showing changes** - PWA service worker caching
2. **Floating chatbot overlapping study tools** - Both buttons positioned at same corner

---

## Problem Analysis

### Issue 1: Preview Caching
The project uses `vite-plugin-pwa` with aggressive caching. The service worker caches assets and API responses, causing stale content in the preview while deployed versions show latest changes.

### Issue 2: Button Overlap
Currently both floating components use nearly identical positioning:
- `OfflineChatbot`: `fixed bottom-4 right-4 z-50`
- `StudyToolsFloating`: `fixed bottom-6 right-6 z-50`

When viewing E-Books or Content with articles, both appear in the bottom-right corner, overlapping each other.

---

## Solution

### Part 1: Fix Preview Caching

**Option A: Disable PWA in Development** (Recommended)

Already implemented - `devOptions.enabled: false` in `vite.config.ts`. However, the service worker may still be cached in browser.

**Fix for User:**
- Clear browser site data: DevTools > Application > Storage > Clear site data
- Or use incognito/private browsing mode
- Or hard refresh: Ctrl+Shift+R / Cmd+Shift+R

### Part 2: Reposition Floating Buttons

Move the `OfflineChatbot` to **bottom-left corner** so it doesn't overlap with `StudyToolsFloating`:

**File: `src/components/OfflineChatbot.tsx`**

| Current | New |
|---------|-----|
| `fixed bottom-4 right-4` | `fixed bottom-4 left-4` |

This keeps both buttons visible:
- **Bottom-left**: Chatbot (global on all student pages)
- **Bottom-right**: Study Tools (only on content/ebook viewing pages)

---

## Implementation Details

### File: `src/components/OfflineChatbot.tsx`

**Change 1: Floating button (closed state) - Line 226-233**
```tsx
// Before:
className="fixed bottom-4 right-4 z-50 ..."

// After:
className="fixed bottom-4 left-4 z-50 ..."
```

**Change 2: Minimized button - Line 238-245**
```tsx
// Before:
className="fixed bottom-4 right-4 z-50 ..."

// After:
className="fixed bottom-4 left-4 z-50 ..."
```

**Change 3: Chat card (open state) - Line 249**
```tsx
// Before:
<Card className="fixed bottom-4 right-4 z-50 ..."

// After:
<Card className="fixed bottom-4 left-4 z-50 ..."
```

---

## Visual Layout After Fix

```
┌─────────────────────────────────────────────────────────┐
│                     Content Area                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [💬]                                            [+]   │
│  Chatbot                                     Study      │
│  (left)                                     Tools       │
│                                             (right)     │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/OfflineChatbot.tsx` | Move all `right-4` to `left-4` (3 locations) |

---

## Expected Behavior After Fix

1. **Chatbot button**: Always visible bottom-left on all student pages
2. **Study tools button**: Bottom-right only when viewing E-Books or article content
3. **No overlap**: Both buttons fully visible and accessible
4. **Mobile friendly**: Proper spacing on small screens

---

## Cache Clearing Instructions for User

To see latest changes in Lovable preview:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Storage" in left panel
4. Click "Clear site data" button
5. Refresh the page
