# Incindra marketing site: UX plan (rev. 2)

**Supersedes:** rev. 1 (single-page audit, "no copy changes").
**Read with:** `CLAUDE.md`. Where the two disagree, `CLAUDE.md` wins.
**Date:** 2026-10-30

## What changed from rev. 1

**Structure.** The site is now split into 7 pages: Home (glance), How it works, Services, Compliance, Platform API, Request a demo, and Privacy. Glance readers stay on Home. Deep readers follow "Go deeper →" links.

**Navigation.** The nav drops from 8 links to 3 plus a demo button. The horizontal nav now fits from 1024px, so the 1260px breakpoint goes away.

**Copy.** The rule changes from "no copy changes" to "no claim changes outside the approved edits". The approved edits are listed in `CLAUDE.md`. They cover:
- softening the reproducibility claims
- the new pricing model: base engagement plus priced per branch, with no numbers shown
- self-contained deployments
- the Incindra brand
- the "coming soon" exclusivity line

**Motion.** The Persistent Thread scope is cut roughly in half.
- Dropped: the fixed page-spine dots (meaningless across short pages), the Who-grid relationship edges (implying links between sides undercuts neutrality), and the duty-table tick spine (decorative).
- Kept: motion that demonstrates the product.

**New work.** A live Formspree form, with a new email field that the original form was missing. Plus a Privacy page, SEO and meta, and legacy hash redirects.

## Findings carried over from rev. 1

These findings still apply to the new pages.

| Pri | Issue | Fix lands in |
|---|---|---|
| P0 | Nav is hidden below 1260px with no replacement | 1.2 |
| P0 | `scroll-padding-top` ignores the 72px sticky header | 1.3 |
| P0 | **New:** the demo form has no email field and is not connected | 3.1 |
| P1 | Duty table: `min-width:720px` clips the third column on mobile | 1.5 |
| P1 | Chips (30px) and Add-to-report (32px) are below the 44px tap target | 1.6 |
| P1 | Hero CTAs always stack, even on desktop | 1.6 |
| P1 | JSON sample scroll is easy to miss and not keyboard-reachable | 1.6 |
| P1 | Method is a flat card grid, so the knowledge graph is never shown | 2.1 |
| P1 | Compliance has no network motif | 1.7 |
| P2 | `--dim` on `--raised` is 4.11:1, failing AA | 1.4 |
| P2 | Breakpoint sprawl (480/520/720/860/900/1260) | 1.4 |
| P2 | Static after the hero, with no section reveals | 2.x |
| P3 | Depth tree SVG labels are cramped at 390px | 2.4 |

## Kept motion (Phase 2 scope; nothing beyond this)

| Where | Treatment | Timing |
|---|---|---|
| Home hero | One soft pulse of the centre hexagon on first paint | 600ms, once |
| Home Problem graphs | "Mapped relationships" edges draw on enter (dashoffset). The siloed card stays still. | 1.1s, 40ms stagger |
| Chronology excerpt (Home and How it works) | When a flagged row enters, a short bezier from the flag chip to its cited `.cite` glows once, then settles to a jade underline | 700ms |
| How it works: Method | The six steps become nodes on a rail: a vertical spine on mobile, a 6-column horizontal rail on `lg`. Steps reveal in order. Step 04 holds the active halo longest. Rail pulse loops while onscreen. | 550ms enter, 3.2s pulse |
| Services: Depth tree | Trunk then branches stroke-draw; Logos micro-nodes fade in after | 1.2s |
| Compliance: gate checklist | Checkmarks scale 1 → 1.08 → 1 as each item enters | 350ms |
| Global | Hover and active states on buttons and cards; chip press scale; optional once-only section-head fade | 120–250ms |

All motion falls back to its final state under `prefers-reduced-motion`.

## Roadmap

### Phase 0: Structure and content (8–10h)

| Ticket | Effort | Acceptance |
|---|---|---|
| 0.1 Scaffold `site/` with the shared `styles.css` and `main.js`. Extract tokens, components and the wordmark from the reference files. | 3h | All 7 pages share one stylesheet and one script. No inline style blocks beyond page-specific one-offs. |
| 0.2 Assemble pages from reference blocks per the IA table in `CLAUDE.md`. | 3h | Every original block appears on exactly one page, except the court-words block (condensed on Home, full on Compliance) and the chronology (preview on Home, full on How it works). |
| 0.3 Apply every approved copy edit. | 1.5h | The grep in `CLAUDE.md`'s definition of done returns nothing, and a diff against the reference shows no other copy changes. |
| 0.4 Add "Go deeper →" links, CTA bands and legacy hash redirects. | 1h | Every page ends with a demo path. Old anchors (`#method`, `#logos`, `#depth`, `#api`) land on their new pages. |

### Phase 1: Responsive foundation (13–16h)

| Ticket | Effort | Acceptance |
|---|---|---|
| 1.1 Header with 3 links and a demo button; `aria-current` on the active page | 1h | Correct active state on all pages |
| 1.2 Drawer below 1024px, shared across pages | 3h | At 390 and 768: 44px rows. Escape and link-tap close it. Body scroll locks. Focus is trapped and restored to the toggle. |
| 1.3 Sticky scroll-padding fix | 0.5h | Every in-page link lands with its heading fully visible |
| 1.4 Breakpoints collapsed to `sm`/`md`/`lg`; all type steps use `clamp()`; `--dim` set to `#8A9E96` | 4h | Visual QA at 390/768/1024/1440 matches the reference look on desktop. Dim-on-raised contrast ≥ 4.5:1. |
| 1.5 Duty table becomes stacked definition cards below 640px | 2.5h | All three columns readable at 390 with no horizontal scroll. Desktop table unchanged. |
| 1.6 Tap targets ≥ 44px; hero CTAs in a row from 560px; JSON block gets `tabindex=0`, an `aria-label` and a fade hint | 2h | Automated target audit passes. JSON sample is keyboard-scrollable. |
| 1.7 Light network motif on the Compliance page hero | 1.5h | Static SVG lattice or reduced canvas. No CLS. Reads as the same brand as Home. |

### Phase 2: Interconnectedness motion (14–16h)

| Ticket | Effort | Acceptance |
|---|---|---|
| 2.1 Method rail with IntersectionObserver step reveals | 6h | Steps light in order. Reduced-motion shows everything in final state. CLS < 0.1. |
| 2.2 Problem-graph edge draw | 2h | Draws once on enter |
| 2.3 Chronology flag → cite glow (shared component) | 4h | One-shot glow with no layout shift, on both pages |
| 2.4 Depth tree stroke-draw; mobile stacked-branch fallback below 640px | 2.5h | Readable at 390. Trunk draws before branches. |
| 2.5 Compliance gate checkmarks | 1h | Items light on scroll; static under reduced-motion |

### Phase 3: Conversion and launch readiness (7–9h)

| Ticket | Effort | Acceptance |
|---|---|---|
| 3.1 Formspree form component, per the spec in `CLAUDE.md` | 3h | Required email field, honeypot, no-PHI helper text, `?role=platform` preselect, `aria-live` status messages, disabled-while-sending state |
| 3.2 Privacy page (marked as a draft) | 1.5h | Covers what is collected, its purpose, the Formspree processor, the no-PHI request and a contact address |
| 3.3 Meta, OG, canonical, `sitemap.xml`, `robots.txt` | 1.5h | Unique title and description per page; exactly one `h1` per page |
| 3.4 Micro-interactions and drawer focus polish | 2h | Consistent timings and no layout shift |

### Phase 4: QA (10–12h)

| Ticket | Effort | Acceptance |
|---|---|---|
| 4.1 Visual regression at 390/768/1024/1440 on all 7 pages | 3h | Rahil signs off |
| 4.2 Reduced-motion, keyboard and VoiceOver smoke test | 3h | All content reachable; no focus traps outside the drawer |
| 4.3 Performance on throttled 4G | 2h | LCP < 2.5s, CLS < 0.1, no long tasks over 50ms |
| 4.4 Cross-browser: Chromium, Safari 17, Firefox | 2h | Dashoffset, IntersectionObserver and the canvas all behave |
| 4.5 Claims and placeholder audit | 1h | Guardrail grep returns nothing; remaining placeholders listed |

**Total: 52–63h, or about 60–72h with buffer.**

## Launch checklist (Rahil)

- [ ] Formspree endpoint supplied (`FORMSPREE_DEMO_ENDPOINT`)
- [ ] Contact email supplied (`CONTACT_EMAIL`)
- [ ] OG image supplied (`OG_IMAGE_PATH`)
- [ ] Privacy page reviewed by counsel
- [ ] Softened reproducibility wording confirmed against how the pipeline actually versions runs
- [ ] One end-to-end test submission received

## Resolved questions from rev. 1

| Question | Resolution |
|---|---|
| Nav length | Resolved by the page split: 3 links plus the demo button |
| Filenames | See the `CLAUDE.md` repo layout |
| Duty table on mobile | Stacked cards |
| Rename | Incindra, settled |
