# CLAUDE.md — Incindra marketing site

Read this file fully before writing code. Build tickets live in `UX-PLAN.md`. Where the two disagree, this file wins.

## What we're building

A multi-page static marketing site for **Incindra**: medical-record analysis for injury litigation. Every causal link in the record is mapped and cited to the page.

- **Primary audience:** US personal-injury and polytrauma counsel, on both plaintiff and defense sides. Secondary audiences are medical providers, experts, and ADR/claims platforms. Platforms get their own page.
- **The site's job:** most visitors arrive by referral, already interested. Two things matter: (1) let them confirm credibility at a glance, and (2) get a demo request. Every page ends with a path to the demo.
- **Two reading depths:**
  - A glance reader stays on Home and gets the full story in about 60 seconds.
  - A deep reader follows "Go deeper →" links into How it works, Services and Compliance.

## Source of truth

- `reference/index.html` and `reference/compliance.html` are the original pages. Never edit them.
- They are the source of truth for all copy, design tokens, SVGs, the hero canvas, the logo/wordmark markup, and the cube motif.
- Lift markup and copy from them. Don't retype copy from memory.

## Repo layout

```
reference/            originals (read-only)
site/
  index.html          Home (glance)
  how-it-works.html
  services.html
  compliance.html
  platform-api.html
  demo.html
  privacy.html
  assets/
    styles.css        all shared CSS (tokens, layout, components, motion)
    main.js           nav drawer, scroll reveals, form, legacy-hash redirects
    hero.js           hero canvas (Home only)
  sitemap.xml
  robots.txt
```

- Use plain HTML, CSS and vanilla JS.
- No framework, no build step, no npm runtime dependencies.
- External requests are limited to Google Fonts (already used) and Formspree.

## Information architecture

**Header nav, all pages:** `How it works` · `Services` · `Compliance`, plus a `Request a demo` button.
- On Home, the button links to `#demo`. On every other page it links to `demo.html`.
- The current page gets `aria-current="page"`.

**Footer, all pages:** wordmark, tagline, and the links Platform API · Compliance · Privacy, then `incindra.net · © 2026 Incindra`.

| Page | Contents, in order | Source blocks |
|---|---|---|
| **Home** | Hero → Problem → Chronology preview → Built to hold up in court (condensed) → Who uses Incindra → Demo form | See the Home section below |
| **How it works** | Method (6 steps) → Why us → Chronology (full) → Logos Assist → CTA band | `#method` steps part, `#approach` "Why us" part, `#chronology`, `#logos` |
| **Services** | Depth section (trunk, branches, consultant, legend) → coming-soon line → CTA band | `#depth` |
| **Compliance** | Page hero → HIPAA → Self-contained deployments → Judicial → Built to hold up in court (full) → CTA band | `reference/compliance.html` plus the court-words block from `#method` |
| **Platform API** | API section (flow, endpoints, JSON sample, terms) → CTA linking to `demo.html?role=platform` | `#api` |
| **Request a demo** | Demo section and form | `#demo` |
| **Privacy** | Short privacy notice (see Form) | new |

### Home (glance), block by block

1. **Hero.** Keep as is, including the canvas. The secondary CTA "See what a chronology shows" goes to `#chronology` on Home.
2. **Problem.** Use the top half of `#approach`: eyebrow, h2, lede, the two graphs, and the "Every field with siloed records…" line. Retarget "See how it works →" to `how-it-works.html`. Do not include "Why us".
3. **Chronology preview.** Use the `#chronology` eyebrow, h2 and lede, the excerpt panel, and the "Connected, not listed" point. End with the link `Everything a chronology covers →`, pointing to `how-it-works.html#chronology`.
4. **Built to hold up in court (condensed).**
   - Keep the h2 and the three columns.
   - Each column keeps its word and one line: Impartial / No side in the outcome; Objective / Measured, not opined; Cited / Every line, to its page.
   - End with the link `How Incindra supports HIPAA and judicial compliance →`, pointing to `compliance.html`.
5. **Who uses Incindra.** As is. The platform line links to `platform-api.html`.
6. **Demo.** The form component (see Form).

Use the same `id`s as the originals where a section moves: `#chronology`, `#logos`, `#method`, `#api`, `#depth`, `#who`, `#demo`.

### Legacy hash redirects (`main.js`, Home only)

On load, if the URL hash matches an old anchor that moved, redirect it to the new page:

| Old anchor | Redirect to |
|---|---|
| `#method` | `how-it-works.html#method` |
| `#logos` | `how-it-works.html#logos` |
| `#depth` | `services.html` |
| `#api` | `platform-api.html` |

`#approach`, `#chronology`, `#who` and `#demo` stay on Home.

## Copy rules

1. **Reuse existing copy verbatim.** The only claim changes allowed are the ones in the table below.
2. **New copy is allowed only for:**
   - page `<title>` and meta tags
   - nav labels
   - "Go deeper →" style links
   - CTA bands, which reuse the demo eyebrow and h2 where possible
   - form helper, success and error text
   - the Privacy page
3. **No new claims.** That means no new numbers, guarantees, certifications, customer names or timelines.
4. **Trimming is allowed** only on Home, and only in the ways listed above.

### Approved copy edits (apply everywhere the text appears)

| Location | Old | New |
|---|---|---|
| Method intro (`#method` lede) | "The same six steps run on every matter, on deterministic models, so the same records always produce the same result." | "The same six steps run on every matter, and every run is versioned, so the same records on the same versions reproduce the same analysis." |
| Court words, Impartial | "The same method, applied the same way, for whichever side engages it." | "The same method, applied the same way, for whichever side engages first." |
| Court words, Objective, item heading | "Same records, same result" | "Reproducible by design" |
| Court words, Objective, item body | "The chronology, causal links and menu analyses come from deterministic models, not prompts. Run the same records twice and the analysis is identical." | "The chronology, causal links and menu analyses run on a fixed, versioned pipeline. Method and model versions are logged, so any analysis can be re-run and compared." |
| API terms strip | "**Deterministic results:** same input, same output" | "**Reproducible results:** versions logged with every job" |
| Compliance judicial row "Is the method reliable?" | "Deterministic models: the same records produce the same analysis every time. A written methodology and a version log accompany every report." | "A fixed, versioned pipeline: the same records on the same versions reproduce the same analysis. A written methodology and a version log accompany every report." |
| Compliance judicial row "Was AI used, and how?" | "Every report carries a use statement. The chronology and analyses come from deterministic models. Logos Assist uses AI prompts, and each question is logged." | "Every report carries a use statement recording where AI was used and which versions ran. Every Logos Assist question and answer is logged." |
| Services lede (`#depth`) | "No tiers and no packages. Every matter starts with the chronology and executive summary, and everything else branches from them. When the case needs…" | "One base engagement, then only what the case needs. Every matter starts with the chronology and executive summary, and everything else branches from them, priced per branch. When the case needs…" (rest unchanged) |
| Services, trunk node | — | Add a small tag, "Base engagement", to the "Chronology and executive summary" node |
| Services, consultant card | `side-tag` "Forensic consultant" | Keep it, and add a second tag: "Separate engagement" |
| Services, below the legend | — | One muted line: "Coming soon: matter exclusivity, enforced by the platform." No link, no elaboration, mentioned nowhere else. |
| Compliance deployment h3 | "Deploy it where your records already live" | "Self-contained deployments" |
| Compliance deployment cards | VM card second, on-prem first | Put the Dedicated virtual machine card first. Change the On-premises `side-tag` to "On-premises · on request". Body copy is unchanged. |
| Footer, both pages | "© 2026 INC" | "© 2026 Incindra" |
| Compliance, court-words block | "See how Incindra supports HIPAA and judicial compliance →" | Remove the link on the Compliance page only, since it points to itself |

### Claim guardrails (never violate)

- Never use "deterministic" or "not prompts" anywhere.
- Never show prices or price figures. Use "priced per branch" and "priced per question" only.
- Never call Incindra "HIPAA compliant" or "HIPAA certified". The existing phrasing ("handles protected health information under HIPAA", "supports") stays.
- The patent is **pending**. Never write "patented".
- Keep "Incindra does not testify, diagnose or give causation opinions" wherever it appears.
- Keep "Counsel, arbitrator, mediator or medical expert decides" wherever it appears.
- Brand is **Incindra** only. No MedRecs, INC Forensic, INC, DART, Braindata or other legacy names in visible copy, meta tags, alt text, comments or file names.
- Keep the wordmark markup (`Inc ı ndra`) exactly as in the reference.

## Design system

- **Tokens:** lift from `reference/index.html` `:root`, with one change: `--dim: #8A9E96` (the original fails WCAG AA on `--raised`).
- **Fonts:** Inter and IBM Plex Mono, using the existing Google Fonts link and preconnects.
- **Motif:** the `--cube` glass node and the jade-on-deep-green field. Compliance gets a light version of the network motif in its page hero.
  - Use a static SVG lattice or a reduced hero canvas. No new libraries.
- **Type:** convert every `--step*` token to `clamp()`. Section padding is `clamp(64px, 8vw, 104px)`.
- **Breakpoints:** fluid, plus `sm <640`, `md 640–1023`, `lg ≥1024`.
  - Horizontal nav from `lg`.
  - Drawer below `lg`.
  - Remove the 480/520/720/860/900/1260 scatter.
- **Sticky header:** `scroll-padding-top: calc(72px + env(safe-area-inset-top, 0px))`.

## Motion rules

- Use SVG, `IntersectionObserver` and CSS transitions only. Canvas is used only in the Home hero.
- No GSAP, Three.js or Lottie.
- **Durations:**
  - micro interactions 120–200ms
  - section enter 500–700ms
  - stroke draw 900–1200ms
- **Easing:** `cubic-bezier(.22,1,.36,1)` for enters and `ease` for color.
- Animate `transform` and `opacity` only (plus `stroke-dashoffset`), with no layout shift.
- Every animation plays **once**, except the Method rail pulse, which pauses when offscreen.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, everything renders in its final state. Focus rings and color changes stay.
- **Scope:** only what `UX-PLAN.md` Phase 2 lists. Don't add decorative motion beyond it.

## Form (Formspree)

One reusable form component, used on Home (`#demo`) and on `demo.html`.

**Fields:**

| Field | Details |
|---|---|
| Name | required, `autocomplete="name"` |
| Email | **required, new field**, `type="email"`, `autocomplete="email"` |
| Firm or practice | `autocomplete="organization"` |
| You are | existing select options |
| About the matter | textarea, existing placeholder |
| `_gotcha` | hidden honeypot |
| `_subject` | hidden, `Incindra demo request` |
| `page` | hidden, `location.pathname` |

**Helper text** under the textarea, always visible: "Please don't include patient names or medical details."

**Role preselect:** `demo.html?role=platform` preselects "ADR or claims platform".

**Endpoint config:** one constant at the top of `main.js`:
```js
const FORMSPREE = { demo: 'FORMSPREE_DEMO_ENDPOINT' };
```
Rahil will supply the URL. Leave the placeholder and list it in the launch checklist.

**Submit behavior:**
- `fetch` POST with `Accept: application/json`.
- Disable the button while sending.
- Show inline status in an `aria-live="polite"` region. Field values stay put on error.
- Success: "Thanks. We received your request and will reply by email."
- Error: "Something went wrong. Please try again, or email us at CONTACT_EMAIL."
- Remove the "Preview site…" note and the old preventDefault stub.
- Client-side validation must give clear inline messages for name and email.

**Privacy page:** short, plain language. It covers:
- what the form collects
- that it's used only to respond to the request
- that Formspree processes submissions
- that no patient information should be sent
- a contact email

Add an HTML comment at the top: `<!-- DRAFT: legal review required before launch -->`.

## SEO and meta

**Titles:**

| Page | Title |
|---|---|
| Home | "Incindra · Every fact reflects the whole" |
| Others | "How it works · Incindra", "Services · Incindra", "Compliance · Incindra", "Platform API · Incindra", "Request a demo · Incindra", "Privacy · Incindra" |

**Every page also gets:**
- a meta description, written from that page's existing lede
- a canonical tag on `https://incindra.net/`
- OG and Twitter tags. Use `OG_IMAGE_PATH` as the image placeholder.
- one `h1` per page

Also add `sitemap.xml` and `robots.txt`.

## Accessibility

- WCAG 2.2 AA.
- Tap targets are at least 44px.
- Visible focus states.
- The drawer: Escape closes it, focus is trapped while open and returns to the toggle on close, and body scroll is locked.
- Scrollable regions (the JSON sample) get `tabindex="0"` and an `aria-label`.
- The duty table becomes stacked definition cards below `sm`.

## Performance budget

- LCP under 2.5s on throttled 4G.
- CLS under 0.1. Reserve the hero canvas height.
- No long tasks over 50ms while scrolling.
- At most 8KB gzipped of new JS and CSS beyond what the originals already ship.

## Placeholders (do not invent values)

- `FORMSPREE_DEMO_ENDPOINT`
- `CONTACT_EMAIL`
- `OG_IMAGE_PATH`

Grep for these before calling the build done, and list any that remain in the final summary.

## Definition of done

- All 7 pages built.
- Every approved copy edit applied, and no other copy changes.
- `grep -ri "determinis\|not prompts\|no tiers\|© 2026 INC\b\|INC Forensic\|MedRecs"` over `site/` returns nothing.
- Visual QA at 390 / 768 / 1024 / 1440 on every page.
- Reduced-motion and keyboard-only passes.
- No console errors and no document-level horizontal overflow.
- Form tested end-to-end once the endpoint is supplied.
