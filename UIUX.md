# A&N LPMS — UI/UX Design System

> This is the single source of truth for all design decisions.
> Claude Code must read this before making any UI changes.

---

## Brand Identity

| Element | Value |
|---------|-------|
| Primary color | `#1A1A1A` (near-black) |
| Accent color | `#B8963E` (heritage gold) |
| Secondary color | `#3D3D3D` (warm gray) |
| Arabic font | Tajawal |
| English headings | Cormorant Garamond |
| English body | DM Sans |
| Style | Monochrome + gold, classic, heritage-inspired |

---

## Layout Rules

- **Default direction:** RTL (Arabic-first)
- **Language:** Bilingual — Arabic primary, English secondary
- **BiDi rule:** English fragments inside Arabic strings MUST be wrapped in `<bdi dir="ltr">`
- **Breakpoints:** Mobile-first, but primary users are desktop (law firm office)

---

## Component Standards

### Buttons
- Primary action: gold `#B8963E` background, white text
- Secondary action: near-black `#1A1A1A` border, no fill
- Destructive: red — only for delete/irreversible actions
- Disabled: gray, no hover effect

### Tables
- Header row: dark background `#1A1A1A`, white text
- Alternating rows: white / light gray `#F9F9F9`
- Approved/Yes cells: green background
- Rejected/No cells: red background
- Permission tables: ✔ green / ✘ red cell backgrounds

### Forms
- Labels above inputs (not inline/placeholder-only)
- Required fields marked with `*`
- Error messages in red below the field
- Success feedback: toast notification (top right)

### Section Headings
- White text on near-black `#1A1A1A` background
- Gold bottom border

### Navigation / Sidebar
- Dark background
- Gold accent on active item
- Icons + text labels (never icons alone)

---

## Page-by-Page Notes

### Login Page
- Full-screen, centered card
- Logo top center
- Microsoft SSO button (production) / simple form (dev)
- No distracting background

### Dashboard
- Summary cards at top (cases, tasks, clients counts)
- Recent activity feed
- Gold accent on key numbers

### Clients Module
- Table view default
- Search + filter bar at top
- Add button top right (gold)

### Cases / Matters
- Linked to client — always show client name
- Status badge: color-coded (Active, Closed, Pending)

### Work Logs
- 5 fields only: Client → Case (auto-filtered) → Work Type → Hours → Billable toggle
- Target: under 30 seconds to complete one entry
- No unnecessary fields

### HR Reports
- Filters at top (date range, employee, department)
- Employee summary table
- Bar chart visualization
- Export button (Excel/PDF)

---

## UX Principles

1. **Speed first** — partners and staff are busy lawyers, not tech users
2. **Arabic-first** — all labels, messages, and feedback in Arabic by default
3. **No confirmation dialogs for reads** — only for destructive actions
4. **Always show loading states** — never leave the user staring at a blank screen
5. **Mobile usable but not mobile-primary** — office desktop is the main device

---

## Known UX Debt (needs improvement)

| Item | Module | Priority |
|------|--------|----------|
| *(Log here as you find issues)* | | |

---

## Decisions Log

> Record any design decision that was debated, so we don't re-debate it later.

| Date | Decision | Reason |
|------|----------|--------|
| 2025 | RTL as default direction | Firm is Arabic-speaking, Saudi market |
| 2025 | Cookie auth in dev, SSO in production | Simplify local dev, secure in prod |
| 2025 | Work log = 5 fields only | Partners want speed, not complexity |
| 2025 | shadcn/ui component library | Consistent, accessible, Tailwind-compatible |
