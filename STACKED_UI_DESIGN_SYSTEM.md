# Stacked — iOS App UI Design System
> Hand this document to Claude Code as context before building any screen.

---

## 1. Brand Overview

**Stacked** is a playful, gamified financial wellness app. The visual language is warm, motivating, and game-like — inspired by Duolingo's tactile UI but applied to a dark-first mobile canvas. Every element should feel pressable, rewarding, and alive.

**Core feeling:** *You're making progress. You're getting Stacked.*

---

## 2. Color Palette

### Brand (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-green` | `#58cc02` | Primary CTA buttons, filled actions, key headings |
| `brand-green-border` | `#46a302` | Bottom border on green buttons (3D press effect) |
| `brand-green-outline` | `#a5ed6e` | Ghost/outlined button borders, link accents, glowing treatment |
| `brand-green-light` | `#d7ffb8` | Soft highlight, pale border wash on cards, bottom shadow on green buttons |

> ⚠️ `#a5ed6e` is **border/outline only** — never use as a filled background.
> ⚠️ `#d7ffb8` is **highlight/wash only** — never as a primary fill.

### Accent (Secondary)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-blue` | `#1cb0f6` | Secondary CTAs, body borders, link text, outlined button borders for non-primary actions |
| `accent-dark-blue` | `#042c68` | Deep heading text, key border treatments, emphasis |
| `accent-midnight` | `#080437` | Dark surface sections, near-black violet used for dark backgrounds and button label text on green fills |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-ink` | `#000000` | SVG fills, max-contrast text |
| `neutral-graphite` | `#3c3c3c` | Dominant neutral border, list and card borders |
| `neutral-charcoal` | `#4b4b4b` | Body copy, icon outlines |
| `neutral-ash` | `#777777` | Secondary text, nav borders |

### App Background

The app uses a **dark theme** as its primary canvas (unlike Duolingo's white). Use `#111111` or `#0d0d0d` as the base background. Cards and surfaces sit at `#1a1a1a`. Use the midnight accent `#080437` for hero/splash sections.

---

## 3. Typography

### Font Stack

**Primary (body, nav, buttons, labels):**
- Font: `Nunito` (Google Fonts) — rounded, friendly, approachable
- Fallback: `Quicksand`, `DM Sans`, system-ui
- Letter spacing: `+0.05em` across all sizes — wide and breezy
- Weights used: `500` (body), `700` (buttons, emphasis, labels)

**Display (headlines only, 32px+):**
- Font: `Nunito` at weight `900` or `800`
- Letter spacing: `-0.02em` — tight and confident
- Used exclusively for oversized feature headlines and screen titles
- Never use display weight below 32px

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 48–64px | 900 | 1.2 | Hero splash text only |
| `heading` | 32px | 800 | 1.25 | Screen titles |
| `heading-sm` | 22px | 700 | 1.4 | Card headers, section titles |
| `body-lg` | 17px | 500 | 1.5 | Primary body copy |
| `body` | 15px | 700 | 1.33 | Button labels, list items |
| `caption` | 13px | 700 | 1.23 | Sub-labels, fine print |

---

## 4. Spacing & Layout

### Base Unit: 8px

| Purpose | Value |
|---------|-------|
| Screen horizontal padding | `24px` |
| Card padding | `20px` |
| Element gap (between items) | `12px` |
| Section gap (between blocks) | `32px` |
| Button height | `56px` |
| Max content width | `390px` (iPhone 14 base) |

### Safe Areas
Always respect iOS safe areas:
- Top: `44px` + status bar
- Bottom: `34px` home indicator

---

## 5. Border Radius

| Element | Radius |
|---------|--------|
| Primary buttons | `16px` |
| Cards | `16px` |
| Pills / tags | `100px` (fully rounded) |
| Input fields | `12px` |
| Answer option buttons | `12px` |

**Rule:** The system uses `12–16px` radius universally. Never use sharp corners (0px) or excessive rounding that differs from this range.

---

## 6. Buttons

### Primary (Green Filled)
```
Background:      #58cc02
Text color:      #080437 (midnight) or #ffffff
Font:            Nunito 700, 15px, +0.05em tracking
Border radius:   16px
Height:          56px
Bottom border:   3px solid #46a302  ← creates 3D press effect
Shadow:          NONE — depth from solid border only
```

### Secondary (Blue Outlined)
```
Background:      transparent
Border:          2px solid #1cb0f6
Text color:      #1cb0f6
Font:            Nunito 700, 15px
Border radius:   16px
Height:          56px
```

### Answer Option (Dark Card Button)
```
Background:      #1a1a1a
Border:          2px solid #3c3c3c
Text color:      #ffffff
Font:            Nunito 600, 15px
Border radius:   12px
Height:          52px
Active state:    Border changes to #1cb0f6, background #0a1f3a
```

### Ghost / Skip
```
Background:      transparent
Text color:      #777777
Font:            Nunito 500, 14px
No border
```

> ⚠️ **Never use box-shadow or drop-shadow on any button.** Depth = solid bottom border only.
> ⚠️ **Never use gradients** anywhere in the system.

---

## 7. Cards & Surfaces

```
Background:      #1a1a1a
Border:          1px solid #3c3c3c
Border radius:   16px
Padding:         20px
Shadow:          NONE
```

Cards are separated by whitespace only — never use background fills on parent containers to differentiate sections.

---

## 8. Onboarding Screens (Tap-to-continue flow)

Each screen has:
- Full dark background `#0d0d0d`
- Animated floating circle/blob centered upper half (brand blue `#1cb0f6`, soft glow)
- Text block bottom half:
  - Headline: 28–32px, weight 800, white
  - Highlighted words: `#1cb0f6` (blue) or `#58cc02` (green)
  - Body: 16px, weight 500, `#cccccc`
- "Tap to continue" label: 13px, `#555555`, centered, bottom

**Screen copy reference:**
1. *"Remember when you used to wake up every day with* **excitement?**"
2. **"It's not your fault."** + body copy about the system
3. *"You've been conditioned..."* + **"drive, and ambition"** highlight
4. *"Your* **financial potential."** + fingerprint metaphor
5. **"Great news, you're already on the right path."**
6. Welcome screen with illustration + **GET STARTED** CTA

---

## 9. Questionnaire Screens

Layout per question screen:
```
- Screen title:     22px, 700, white
- Subtitle/hint:    14px, 500, #777777
- Answer buttons:   Full-width dark card buttons (see Section 6)
- Skip link:        Ghost style, bottom center
- Progress bar:     Thin 4px bar, top of screen, green fill on dark track
```

**Multi-select screens:**
- Add checkbox `☐` left of label inside the button
- Selected state: checkbox filled green `#58cc02`, border turns green

---

## 10. Results / Score Screen (Wealth Score)

Layout:
```
- Title:             "Your Wealth Score" — 28px, 800, white
- Subtitle:          14px, #777777
- Score grid:        2-column, 3 rows
- Score card:
    Background:      #1a1a1a
    Border:          1px solid #3c3c3c
    Label:           13px, 700, #777777
    Number:          40px, 900, white
    Progress bar:    Full width, 6px tall, red (#ff4b4b) fill = current score
    Border radius:   12px
- CTA button:        Full-width green primary — "Show my potential score →"
```

Score dimensions:
- Overall, Money Mindset, Clarity, Discipline, Focus, Investment Readiness

---

## 11. Potential Score Screen

Same layout as Wealth Score but:
- Score bars fill **green** `#58cc02` instead of red
- Delta labels show `(+XX)` in green next to each score
- CTA: **"ENTER THE APP →"** — large green primary button

---

## 12. Paywall Screen

```
- Background:        #0d0d0d
- Close button:      Top right, ✕, #777777
- Headline:          "Do more of what builds your wealth — and stress less"
                     28px, 800, white
- Sub-headline:      16px, 500, #cccccc
- Checkmarks:        #58cc02 ✓
- Plan cards:
    Layout:          Full-width, stacked vertically
    Background:      #1a1a1a
    Border:          2px solid #3c3c3c
    Selected border: 2px solid #58cc02
    Radio:           Left aligned, green when selected
    Price label:     17px, 700, white
    Badge (% off):   Pill, background #58cc02, text #080437, 12px 700
- CTA:               Full-width green primary — "Continue for free →"
- Footer links:      13px, #555555, centered — "Restore · Terms · Privacy"
```

---

## 13. Gamification / Home Screen

### League Badge
```
- Circle avatar:     96px diameter, gradient border (blue → green)
- League label:      "Beginner League" — 18px, 700, white
- Sub-label:         "X lessons until Challenger League" — 13px, #777777
```

### Stats Row (3 columns)
```
- Icon + number + label
- Background:        #1a1a1a card
- Border:            1px solid #3c3c3c
- Stats:             Day Streak 🔥 | Lessons 📘 | Credits 💎
```

### Submit Goal CTA
```
Full-width blue outlined button: "SUBMIT YOUR OWN GOAL"
```

### Bottom Navigation
4 tabs: Search | Home | Lessons | Profile
Active tab: `#58cc02` icon, inactive: `#555555`

---

## 14. Notification Permission Screen

```
- Background:        #0d0d0d
- Icon:              Bell 🔔 centered, 64px, brand blue glow
- Headline:          22px, 800, white
- Body:              15px, 500, #cccccc
- Enable button:     Full-width green primary ✅
- Skip:              Ghost link below
```

---

## 15. Interaction & Animation Principles

| Pattern | Behaviour |
|---------|-----------|
| Button press | Scale to `0.97`, bottom border collapses to `1px` — tactile feel |
| Screen transition | Horizontal slide (push) for forward, pop for back |
| Answer selection | Instant border highlight, subtle bounce scale `1.02` |
| Score reveal | Count-up animation from 0 to final value, 800ms ease-out |
| Progress bar | Animated fill left → right on screen load, 600ms |
| Loading screen | Pulsing circle animation, "Building your plan…" with ellipsis |

---

## 16. Illustrations

- Style: **Flat line art**, single stroke weight, colourful but limited palette
- Characters: Abstract, friendly, non-literal (currency symbols, upward arrows, growth plants, trophy)
- Colours: Use brand palette only — green, blue, white strokes on dark background
- Used on: Welcome screen, empty states, achievement unlocks
- Never use: Stock illustrations, photography, 3D renders, gradients in illustrations

---

## 17. iOS-Specific Notes

- Use `SF Pro` as system fallback if Nunito fails to load
- Respect `Dynamic Type` — never hardcode font sizes without `scaledFont`
- Status bar: **light content** (white text) — dark background throughout
- All tap targets minimum `44×44pt`
- Use `UIImpactFeedbackGenerator` (.medium) on button taps for haptic feedback
- Support Dark Mode only — no light mode variant needed

---

## 18. Do / Don't Summary

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `#58cc02` for all primary CTAs | Use gradients anywhere |
| Use solid bottom border for 3D button depth | Use box-shadow or drop-shadow |
| Use `12–16px` border radius consistently | Mix radius values |
| Use Nunito 700–900 for all text | Use system default font without override |
| Use `+0.05em` letter spacing on body | Use tight tracking on body copy |
| Use dark `#0d0d0d` background | Use white or light backgrounds |
| Separate sections with whitespace | Use filled container backgrounds as dividers |
| Use `#a5ed6e` as outline/border only | Use `#a5ed6e` as a fill |
| Animate score reveals and progress bars | Show static numbers without animation |
| Add haptic feedback on interactions | Ignore tactile feedback on mobile |

---

*Document version: 1.0 — Stacked iOS App*
*Prepared for Claude Code context handoff*
