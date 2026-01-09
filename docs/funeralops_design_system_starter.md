# FuneralOps — Design System Starter (shadcn + Tailwind)
Theme: **Precision GuardVibe — Clinical Precision + Empathetic Warmth**

This document defines tokens + layout rules to keep the UI consistent from day one.

---

## 1) Brand Palette (Provided)

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary Brand | Deep Teal | `#006D77` | Top nav, primary actions, active states |
| Background (App) | Pale Ice | `#EDF6F9` | Main app background |
| Background (Panel) | White | `#FFFFFF` | Cards, modals, content areas |
| Text (Main) | Ink Blue | `#2B2D42` | Primary text |
| Text (Muted) | Slate | `#64748B` | Secondary text, labels |
| Accent/Secondary | Soft Aqua | `#83C5BE` | Secondary buttons, highlights |
| Alert/Blocker | Brick Red | `#BC4749` | **Critical compliance blockers only** |
| Success/Safe | Muted Green | `#6A994E` | Completed, “Ready” |
| Family Portal BG | Warm Cream | `#FFFAF0` | Portal background only |

**Rule:** Brick Red is reserved for **blocking compliance**. Do not use it for generic errors.

---

## 2) Tokenization Approach (shadcn style)

Use CSS variables + Tailwind mapping.

### 2.1 CSS Variables (Light Theme)
Create `app/globals.css`:
```css
:root {
  /* base surfaces */
  --background: 238 246 249;      /* Pale Ice */
  --foreground: 43 45 66;         /* Ink Blue */

  --card: 255 255 255;            /* White */
  --card-foreground: 43 45 66;

  --popover: 255 255 255;
  --popover-foreground: 43 45 66;

  /* brand */
  --primary: 0 109 119;           /* Deep Teal */
  --primary-foreground: 255 255 255;

  --secondary: 131 197 190;       /* Soft Aqua */
  --secondary-foreground: 43 45 66;

  /* semantic */
  --destructive: 188 71 73;       /* Brick Red */
  --destructive-foreground: 255 255 255;

  --success: 106 153 78;          /* Muted Green */
  --success-foreground: 255 255 255;

  /* neutrals */
  --muted: 237 246 249;           /* Pale Ice */
  --muted-foreground: 100 116 139;/* Slate */

  --border: 226 232 240;          /* subtle border */
  --input: 226 232 240;
  --ring: 0 109 119;

  /* radius */
  --radius: 0.75rem;
}
```

### 2.2 Family Portal Theme Override
Wrap portal root with `.family` class and override:
```css
.family {
  --background: 255 250 240;      /* Warm Cream */
  --foreground: 43 45 66;
  --card: 255 255 255;
  --card-foreground: 43 45 66;
  --primary: 0 109 119;
  --secondary: 131 197 190;
  --ring: 0 109 119;
}
```

### 2.3 Tailwind Config (key mapping)
```ts
// tailwind.config.ts
theme: {
  extend: {
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    colors: {
      background: "rgb(var(--background) / <alpha-value>)",
      foreground: "rgb(var(--foreground) / <alpha-value>)",
      card: "rgb(var(--card) / <alpha-value>)",
      "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
      popover: "rgb(var(--popover) / <alpha-value>)",
      "popover-foreground": "rgb(var(--popover-foreground) / <alpha-value>)",
      primary: "rgb(var(--primary) / <alpha-value>)",
      "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
      secondary: "rgb(var(--secondary) / <alpha-value>)",
      "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",
      muted: "rgb(var(--muted) / <alpha-value>)",
      "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
      destructive: "rgb(var(--destructive) / <alpha-value>)",
      "destructive-foreground": "rgb(var(--destructive-foreground) / <alpha-value>)",
      success: "rgb(var(--success) / <alpha-value>)",
      "success-foreground": "rgb(var(--success-foreground) / <alpha-value>)",
      border: "rgb(var(--border) / <alpha-value>)",
      input: "rgb(var(--input) / <alpha-value>)",
      ring: "rgb(var(--ring) / <alpha-value>)",
    },
  },
}
```

---

## 3) Typography

**Font pairing (recommended):**
- UI: `Inter` (clean, readable)
- Optional headings: `Inter` only (keep minimal, professional)

### Type scale (Tailwind)
- `text-xs` labels/metadata
- `text-sm` form labels, helper text
- `text-base` body
- `text-lg` section headers
- `text-xl` page titles
- `text-2xl` marketing hero only

Rules:
- Use `text-foreground` for primary text
- Use `text-muted-foreground` for secondary metadata

---

## 4) Spacing & Layout

### 4.1 Page structure
- App background: `bg-background`
- Panels: `bg-card` with `border border-border`
- Default padding: `p-4` (mobile) / `p-6` (desktop)

### 4.2 Grid
- Use 12-col grid on desktop for dashboards
- Keep content max-width ~1200px for forms, allow tables full width

### 4.3 Rhythm
- Vertical spacing between sections: `space-y-6`
- Within cards: `space-y-3`

---

## 5) Component Rules (shadcn usage)

### Buttons
- Primary: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Ghost: for low emphasis
- Destructive: **ONLY** for critical compliance actions/overrides

### Badges
- Blocked: `bg-destructive text-destructive-foreground`
- Pending: use `bg-secondary/30 text-foreground`
- Ready: `bg-success text-success-foreground`

### Cards
- Always `bg-card border border-border rounded-lg shadow-sm`
- Keep headers consistent:
  - title left, actions right

### Tables (DataTable)
- zebra stripes optional (very subtle)
- row hover: `bg-muted/50`
- keep actions in right-most column

### Forms
- shadcn `Form` + `zod` validation
- Show errors below inputs in muted red (NOT Brick Red badges)
- Brick Red reserved for blockers; field errors should be subtle

### Dialogs & Sheets
- Dialog for confirmation + short forms
- Sheet for multi-step quick flows (request signature, generate pack)

### Alerts
- Info: muted
- Critical blocker: Brick Red, high contrast, explicit action

---

## 6) “Calm UX” Rules (important)

1) **One primary CTA per view**
2) **Blockers are explicit and actionable**
3) **Avoid dense screens**: prefer sections and progressive disclosure
4) **Keyboard-first**: inputs support tab order + quick save
5) **Search everywhere**: command palette + local filters

---

## 7) Compliance Color Use Policy

- Brick Red (`#BC4749`) is only for:
  - “Case Blocked” states
  - “Cannot Close Case” barriers
  - Admin compliance overrides

- Regular validation errors: use muted styling, not “panic red”

---

## 8) Family Portal Styling

- Apply `.family` theme class at portal root
- Use more whitespace, softer card shadows
- Copy tone: calm, reassuring, short sentences
- Avoid admin jargon
- Large touch targets (44px min height)

---

## 9) Iconography & Motion

- Icons: Lucide (default shadcn)
- Motion: minimal
  - subtle hover transitions
  - progress animations only in portal stepper

---

## 10) Example Component Inventory (MVP)
- Today Board Card
- Case Timeline Stepper
- Blocker List (with Fix CTA)
- Pack Generator Modal
- Signature Request Sheet
- Template Editor
- Family Stepper Form
- Upload Dropzone
- Audit Log Table
