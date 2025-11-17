# CSS Custom Property Syntax Fix Reference

## Problem
Tailwind CSS v4 requires CSS custom properties to be wrapped in square brackets with `var()` function.

**Error Message:**
\`\`\`
Unhandled promise rejection: Error: Invalid custom property, expected a value
\`\`\`

## Invalid vs Correct Syntax

### Invalid ❌
\`\`\`tsx
origin-(--radix-popover-content-transform-origin)
max-h-(--radix-select-content-available-height)
w-(--sidebar-width)
size-(--calendar-cell-size)
\`\`\`

### Correct ✅
\`\`\`tsx
origin-[var(--radix-popover-content-transform-origin)]
max-h-[var(--radix-select-content-available-height)]
w-[var(--sidebar-width)]
size-[var(--calendar-cell-size)]
\`\`\`

## Pattern to Find
**Regex:** `(\w+)-$$(--[\w-]+)$$`

This matches any Tailwind property followed by a CSS variable in parentheses.

## Pattern to Replace
**Replacement:** `$1-[var($2)]`

Wraps the variable in square brackets and adds the `var()` function.

## Affected Files (Common List)
1. `components/ui/calendar.tsx` - 7 instances
2. `components/ui/chart.tsx` - 1 instance
3. `components/ui/context-menu.tsx` - 2 instances
4. `components/ui/dropdown-menu.tsx` - 2 instances
5. `components/ui/hover-card.tsx` - 1 instance
6. `components/ui/menubar.tsx` - 2 instances
7. `components/ui/popover.tsx` - 1 instance
8. `components/ui/select.tsx` - 1 instance
9. `components/ui/sidebar.tsx` - 7 instances
10. `components/ui/tooltip.tsx` - 1 instance

## Quick Fix Options

### Option 1: Run the Script
\`\`\`bash
node scripts/fix-css-custom-properties.js
\`\`\`

### Option 2: Manual Fix with Search/Replace
1. Search for: `(\w+)-$$(--[\w-]+)$$` (with regex enabled)
2. Replace with: `$1-[var($2)]`
3. Apply to all files in `components/ui/*.tsx`

### Option 3: File-by-File Examples

**popover.tsx (line 33):**
\`\`\`tsx
// Before
className="origin-(--radix-popover-content-transform-origin)"

// After
className="origin-[var(--radix-popover-content-transform-origin)]"
\`\`\`

**select.tsx (line 64):**
\`\`\`tsx
// Before
className="max-h-(--radix-select-content-available-height)"

// After
className="max-h-[var(--radix-select-content-available-height)]"
\`\`\`

**sidebar.tsx (line 173):**
\`\`\`tsx
// Before
className="w-(--sidebar-width)"

// After
className="w-[var(--sidebar-width)]"
\`\`\`

## Why This Happens
- These UI components come from shadcn/ui library
- Sometimes the library components have outdated Tailwind v3 syntax
- Tailwind CSS v4 enforces stricter parsing rules
- When components are added/updated, the old syntax may return

## Prevention
- Always verify new UI components from shadcn/ui
- Run the fix script after adding new shadcn components
- Keep this reference document for quick access

## Step-by-Step Fix Instructions for v0

1. **Verify the error** - Check for "Invalid custom property" in console
2. **Grep for invalid patterns** - Use pattern: `-\(--` to find all instances
3. **Read affected files** - Always read before editing
4. **Apply fixes** - Replace with correct syntax: `property-[var(--variable)]`
5. **Verify** - Grep again to confirm all instances fixed

## Version Restore Notes
If you restore to an earlier version:
- This reference document survives (it's a separate uploaded file)
- The script in `/scripts/` may not exist in older versions
- Recreate the script using the code above
- Or manually fix using the patterns documented here
