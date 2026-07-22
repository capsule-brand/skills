---
name: capsule-brand
description: Capsule's official brand system — Pantone/CMYK/HEX palette, typography, logo files, textures, deck structure, voice, and boilerplate copy. Use this skill whenever producing ANY Capsule-branded material, including presentations and decks, proposals, one-pagers, reports, case studies, HTML artifacts, landing pages, documents, or social posts. Trigger it even when the request doesn't say "on-brand" — if the deliverable goes out under Capsule's name or to a Capsule client, apply this skill by default. Also use when someone asks what our colors are, what the Pantone numbers are, what font we use, how to make something look like us, or needs a logo file.
---

# Capsule Brand System

The visual and verbal identity for Capsule, a special projects agency in Northeast Minneapolis. Sourced from the official brand board (`Capsule System Elements v2`) and the live deck template.

**Keywords**: Capsule brand, brand colors, Pantone, PMS, brand fonts, on-brand, house style, agency deck, Capsule template, logo, brand guidelines, visual identity

---

## Colors

Eleven colors. Deep neutrals against a sage/aqua family, with an acid chartreuse and a hot red doing the work. A warm sand sits apart from everything else and carries the statement moments.

Print work uses the **Pantone** value. Process work uses the **CMYK** build. Screen uses **HEX**. Do not convert between them yourself — the values below are the approved conversions.

| Name | Pantone | HEX | CMYK | Role |
|---|---|---|---|---|
| **Ink** | PMS 419 C | `#232121` | 75 / 65 / 66 / 90 | Primary dark, body copy, dark grounds |
| **Forest** | PMS 3305 C | `#16392D` | 93 / 13 / 61 / 62 | Deep accent ground, section breaks |
| **Slate** | PMS 425 C | `#444949` | 69 / 58 / 58 / 40 | Secondary text, captions, metadata |
| **Sage** | PMS 429 C | `#BAC8C7` | 35 / 23 / 19 / 2 | Rules, dividers, secondary text on dark |
| **Sand** | PMS 7527 C | `#EAE7D5` | 7 / 5 / 16 / 0 | Warm ground for statement and quote slides |
| **Mist** | *(none assigned)* | `#F2F5F5` | 4 / 2 / 2 / 0 | Default light background |
| **Pale** | PMS 9102 C | `#E9EEE9` | 7 / 3 / 7 / 0 | Secondary light ground, card fills |
| **Powder** | PMS 9420 C | `#D3E7E8` | 16 / 2 / 7 / 0 | Tints, grounds behind aqua elements |
| **Red** | PMS 186 C | `#C4242B` | 9 / 100 / 100 / 2 | Emphasis, eyebrows, the mark |
| **Acid** | PMS 4232 C | `#CACA2B` | 15 / 1 / 95 / 2 | The signature. Highlights, one CTA per view |
| **Aqua** | PMS 3105 C | `#7AC8CA` | 49 / 0 / 15 / 0 | Supporting accent, chart series |

Mist has no Pantone equivalent on the board — it's screen-and-process only. For print, substitute Pale (PMS 9102 C) or run it as a 4-color build.

### Hover / darker variants (screen only)

`Acid → #A0A022` · `Red → #991C22` · `Aqua → #56B9BB`

### Contrast rules (WCAG-verified — follow these, don't eyeball it)

**Acid, Aqua, Sage, and Sand are LIGHT colors.** This is the most common mistake in the system. They read as bright and get treated as though they can carry white text. They cannot.

- On **Acid** `#CACA2B` → Ink (9.1:1 ✓) or Forest (7.2:1 ✓). **Never white** (1.8:1 ✗).
- On **Aqua** `#7AC8CA` → Ink (8.3:1 ✓) or Forest (6.6:1 ✓). **Never white** (1.9:1 ✗).
- On **Sage** `#BAC8C7` → Ink (9.3:1 ✓) or Forest (7.3:1 ✓). **Never white** (1.7:1 ✗).
- On **Sand** `#EAE7D5` → Ink (12.9:1 ✓), Forest (10.2:1 ✓), or Slate (7.4:1 ✓). Red passes at 4.6:1 for headings. **Never white** (1.2:1 ✗).
- On **Red** `#C4242B` → white or Mist (5.8:1 / 5.3:1 ✓). **Never Ink** (2.8:1 ✗).
- On **Ink** / **Forest** → Mist, Pale, or white (10.8:1+ ✓). Sage for secondary text only.
- On **Mist** / **Pale** → Ink (14.6:1 / 13.6:1 ✓) or Forest (11.6:1 / 10.8:1 ✓).

Ink and Forest are only 1.3:1 apart — never use them as a foreground/background pair. Same for Mist and Pale.

### Proportion

Roughly 70% neutral ground, 20% supporting, 10% accent. One dominant accent per deck. Red does the structural work (eyebrows, the mark, rules); Acid is reserved for genuine emphasis. Using both loudly in one composition flattens the system.

---

## Typography

Three families, all licensed. Files ship with this skill's source folder; install via Font Book.

| Role | Family | Fallback chain |
|---|---|---|
| **Display / headings** | Britanica | `Jost, "Helvetica Neue", Helvetica, Arial, sans-serif` |
| **Editorial serif** | GT Super Display | `Utopia, "Utopia Std", Georgia, serif` |
| **Body / UI** | Proxima Nova | `"Helvetica Neue", Helvetica, Arial, sans-serif` |

### Britanica

The identity's workhorse, and a very large family — five widths (Normal, SemiCondensed, Condensed, SemiExtended, Extended) across nine weights (Thin, Light, Regular, Bold, ExtraBold, Black, Heavy) with italics throughout.

- **Britanica Black / ExtraBold** — headline moments, title slides
- **Britanica Bold** — standard headings
- **Britanica Regular / Light** — subheads, large quiet type
- **Britanica Extended Light** — wide, airy display lines. Large sizes only; it disappears below ~24pt.
- **Condensed widths** — dense label sets and tight columns, not body copy

The house move is **all caps with wide letterspacing** for eyebrows, labels, and capability lists. Set tracking generously — roughly +8 to +15% at small sizes.

### GT Super Display

The editorial voice. Statement slides, pull quotes, feature openers, anywhere the work should feel considered rather than punchy.

**Only two cuts are licensed** — Display Light and Display Light Italic. There is no Regular, no Bold, no other optical size. Any layout calling for a heavier serif is outside what Capsule owns; use Britanica instead rather than faking weight. Both cuts ship in .otf, .ttf, .woff and .woff2.

### Proxima Nova

Working copy — body text, captions, UI. 1.5–1.6 line height.

### Web and HTML artifacts

Britanica ships via Fonts.net, Proxima Nova via Adobe Typekit. Neither loads in an artifact, so declare the full chain and let it fall through:

```css
--font-display: Britanica, Jost, "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-serif: "GT Super Display", Utopia, "Utopia Std", Georgia, serif;
--font-body: proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**Jost** is the closest free stand-in for Britanica — measured, not guessed (see below). **Playfair Display** or **Source Serif 4** for GT Super. Say which substitute was used rather than silently swapping.

GT Super ships **.woff2**, so it can be embedded as a real webfont where the Grilli Type licence covers it — check the licence before putting it on a public page. Britanica ships **.otf only** and would need conversion for web use.

### Fallback metrics — measured

Substitutions were chosen by comparing set width (sum of lowercase advances) and x-height against the real faces. Britanica has an unusually **low x-height for a modern grotesque** — 450/643, a ratio of 0.700 — which is why the obvious large-x-height candidates all run too big and too wide.

| Candidate | Set width Δ | x-height Δ | Verdict |
|---|---|---|---|
| **Jost** | **−2.2%** | **+2.2%** | Closest by a wide margin. Use this. |
| Figtree | +4.7% | +11.1% | Acceptable second |
| Manrope | +5.5% | +20.0% | x-height far too large |
| Archivo | +9.2% | +16.9% | Runs ~9% wide — headlines reflow |
| Inter | +12.5% | +21.3% | Too wide |
| Poppins | +17.8% | +21.8% | Much too wide |

For GT Super Display Light (x-height 490, cap 700, also 0.700):

| Candidate | Set width Δ | x-height Δ | Verdict |
|---|---|---|---|
| **Playfair Display** | +5.4% | +4.9% | Closest on contrast and proportion |
| Source Serif 4 | +5.6% | −3.1% | Tied on metrics, lower contrast |
| Lora | +8.5% | +2.0% | Workable |
| EB Garamond | −9.5% | −18.4% | Far too small |

Reference metrics, per 1000 upm: **Britanica Regular** x-height 450, cap 643, `n` 512. **Britanica Bold** x-height 450, cap 643, `n` 501. **GT Super Display Light** x-height 490, cap 700, `n` 573.

For .pptx and .docx, set the primary face and let the system fall back. Do not embed licensed fonts in files sent outside Capsule.

---

## Logos

Two lockups: the **wordmark** (CAPSULE, with the C built from the mark) and the **C mark** alone. Files in `assets/logos/`:

| File | Use |
|---|---|
| `wordmark-red.svg` | Primary full-color wordmark, light grounds |
| `wordmark-white.svg` | Wordmark reversed, dark grounds |
| `wordmark-black.svg` | Single-color wordmark, black |
| `mark-red.svg` | C mark, red |
| `mark-white.svg` | C mark reversed |
| `mark-black.svg` | C mark, single-color black |

### Red is always #C4242B

**PMS 186 C / `#C4242B` is the red. Use it everywhere, without exception.** Any other red is wrong, including reds found inside older Capsule files.

The logo SVGs bundled with this skill have been **normalized to `#C4242B`** and are correct as shipped.

The master files still in Dropbox have not. Two legacy values are in circulation there:

- `art.capsule-logo-full-color-pms-c.svg` carries `#b90021`
- `ART.Capsule.C.Red.svg` carries `#d61f26`

If you pull a logo from the Logo Collection folder rather than from this skill, **check the fill and correct it to `#C4242B` before using it.** The mismatch is subtle in isolation and obvious the moment the mark sits beside a red rule, a Red-filled shape, or the title-slide texture bar.

The same rule governs generated work: every red in a deck, document, artifact or export is `#C4242B`, `PMS 186 C` in print, `C9 M100 Y100 K2` in process.

The **25th anniversary badge** is also in active use — it appears on the closing slide of the current deck, stacked above the C mark bottom right. It isn't in this package; pull it from the Logo Collection folder when needed. Being tied to a founding year of 1999, confirm it's still current before putting it on anything dated forward.

### Rules

- Clear space: minimum one cap-height of the wordmark on all sides.
- Minimum size: wordmark no smaller than 100px / 1 inch wide; mark alone no smaller than 24px.
- The mark alone is for contexts where Capsule is established — slide footers after the title, favicons, avatars. Lead with the wordmark.
- The mark may be knocked out as a solid single-color shape. Never as a two-tone lockup.
- Never stretch, rotate, add effects, outline, place on busy photography without a scrim, or rebuild the wordmark in a substitute face.

---

## Textures

Thirteen files. The naming decodes as **letter = composition, suffix = colorway** — so `CAP.texture.C.Green` and `CAP.texture.C.Lgray` are the same artwork in different tonalities. That's the useful part of the system: a composition can be carried through a deck while the color shifts with the section.

They are **not** all halftone dot fields. Each family is a different underlying construction with spray or stipple grain laid over it.

| Family | Construction | Colorways |
|---|---|---|
| **A** | Soft airbrushed cloud forms, atmospheric and directionless | Lgray |
| **B** | Two-panel split, fine even stipple, nearly flat — the quietest in the set | Lgray, Mgray |
| **C** | Offset collaged rectangles with a diagonal light sweep across them | Lgray, Mgray, **Green** |
| **D** | Woven plaid grid — horizontal and vertical rules crossing into a tartan | Green |
| **E** | Horizontal striations, woodgrain-like banding | Red |
| **F** | Hard-edged geometric arches, heavy stipple, two-tone | Blue (Aqua) |
| **G** | Marbled liquid ink swirl, fluid and psychedelic-adjacent | Blue (Aqua) |
| **H** | Dark spray cloud, heavy grain | Dark |
| **I** | **The C mark ghosted into a red field** — a branded texture, not an abstract one | Red |
| **bar** | Horizontal crop of the E striation, banner proportion (7.7:1) | Red |

### Which to use where

- **C.Green** is the section-divider texture in the current deck. Use it for Forest dividers.
- **bar** is the title-slide device — the red band across the top fifth. It is a crop of E.Red, so the two match if used in the same deck.
- **A**, **B**, and the gray C variants are backgrounds quiet enough to sit behind type. B is the safest.
- **F**, **G**, and **I** are strong enough to be the subject of a slide, not a backdrop. Don't put body copy on them.
- **I.Red** carries the mark. Treat it as a logo placement, not a pattern — it shouldn't appear on the same spread as another C mark.
- **H.Dark** is the only near-black option and is the right ground when Forest feels too green.

### Practical

Source: `Design Resources/ >> Logo Collection <</Capsule/Claude - Design System/Textures/` — note the leading space before `>>`.

These are raster PNGs at roughly 4000–6000 px on the long edge, 49 MB for the set, so they are not bundled with this skill. Aspect ratios vary and matter: A, B, C are 1.53:1; D is 3:2; E, G, H are square; F is 1.81:1; I is 1.67:1; the bar is 7.7:1. Crop rather than stretch — the grain is directional and distorts visibly.

One texture per deck. A texture plus an accent color plus a photograph in one composition is too much; pick two.

---

## Deck system

16:9, 720 × 405 pt. Decks run **light by default** — Pale `#E9EEE9` is the standard ground, with Forest reserved for dividers and closing. Britanica does nearly all the work; GT Super appears only on the closing slide.

### Persistent furniture

Every interior slide carries these. They are quiet and should stay quiet.

- **C mark, top right**, small (~20px), tinted well back — Sage on light grounds, a slightly lighter Forest on dark. It reads as a watermark, not a logo placement.
- **`©2025 capsule` bottom left**, tiny, set with the wordmark lockup, Sage.
- **Page number bottom right**, tiny, Slate on light and Sage on dark.
- Title slide and full-bleed dividers carry no page number.

### Slide types

**Title** — Pale ground, *not* dark. A **red texture bar** spans the full width across the top ~20%. Below it: the date in small red Britanica, then the red wordmark set beside it on the same baseline. The headline sits at lower left, **in Red**, using a two-weight treatment — Bold for the client or subject line, Light for the descriptor beneath (`Buck Knives:` bold over `Packaging Transformation` light). Red C mark bottom right.

**Statement** — Forest ground split roughly 40/60 with a duotoned photograph at left. Copy at right in Britanica Bold with a **two-tone emphasis treatment**: the setup in Sage, the payoff words in white (`Capsule is a special projects agency solving unique challenges in` — sage — `brand, design & marketing.` — white). This is the deck's signature move and it does the work of a highlighter without adding a color.

**Section divider** — Forest, full-bleed texture, single centered word or phrase in Britanica Bold, Sage. Centered, not left-aligned — the only slides in the system that center.

**Eyebrow + list** — Pale ground. Red all-caps eyebrow, Britanica Bold, wide tracking, upper area. List below in Britanica Light at generous size and leading. Often paired with a full illustration at left.

**Three-column** — Pale ground. Illustration above each column, heading in **Red** Britanica Bold, body in Slate.

**Icon grid** — Pale ground with a duotoned photo panel at left. Two columns of Forest monoline icons paired with Britanica Light labels in Forest.

**Detail / scope slide** — Pale or Mist ground. Gray all-caps navigational eyebrow top left (`EXPLORE`, `STRATEGY`, `IMPLEMENTATION`). Large Britanica Bold title in Slate. Body organized under **red all-caps subheads** (`APPROACH AT A GLANCE`, `DELIVERABLES`, `INVESTMENT`, `NOTES`). Notes in italic.

**Case study** — Pale sidebar column at left (~26% width) holding `CLIENT:`, `CHALLENGE`, `DETAILS`. Client logo top right. Imagery fills the remainder. Link at the bottom of the sidebar in **Aqua**, bold italic underlined (`BROWSE THE CASE STUDY`).

**Closing** — Forest with texture. `Thank` in GT Super Display Light, Sage — `you` in GT Super Display **Italic, Acid**. This is the one place Acid appears at scale, and it lands because nothing else in the deck competes. Contacts below in Britanica, white, with email links in Acid. 25th anniversary badge and C mark stacked bottom right.

### Two eyebrow colors

The system uses eyebrows for two different jobs and colors them differently. **Red** eyebrows label content (`WE ARE`, `IN-HOUSE CAPABILITIES`, `DELIVERABLES`). **Gray/Slate** eyebrows label position in the deck (`EXPLORE`, `RELEVANT WORK`, `PROJECT ROADMAP AT A GLANCE`). Don't mix them.

### Emphasis within body copy

Rather than bolding, the deck recolors the emphasized phrase — Aqua on light grounds, Forest for a quieter lift, white against Sage on dark. Keep the weight constant and let color carry it.

### Illustration

Custom vector illustrations built from organic blob shapes in Aqua and Forest, filled with **halftone dot texture**, with Red and Acid used sparingly as small accents. Subjects are playful and slightly surreal — a rocket, a unicorn ringed by an Acid orbit, a ferris wheel. Line work is thin and white or Red. These are a signature asset; don't substitute stock illustration or clip art.

### Icons

Monoline, geometric, abstract, drawn in Forest at a consistent stroke weight. Paired with Britanica Light labels.

### Charts

The current template's Gantt uses colors from **outside** the brand palette — a mid blue, a plum, an orange-red, and a bright green. Treat that as legacy rather than a standard. For new work use Forest → Aqua → Sage → Acid → Red, with Ink for axes and labels and Sage for gridlines.

---

## Documents and reports

- Mist or white page, Ink body copy at 10–11pt Proxima Nova
- Headings in Britanica Bold, Ink or Forest
- Rules and dividers in Sage, hairline
- Pull quotes in GT Super Display, Forest, indented
- Wordmark in the header of page one only; mark in the footer thereafter

---

## HTML artifacts and landing pages

```css
:root {
  --ink:#232121;   --forest:#16392D; --slate:#444949;
  --sage:#BAC8C7;  --sand:#EAE7D5;   --mist:#F2F5F5;
  --pale:#E9EEE9;  --powder:#D3E7E8;
  --red:#C4242B;   --acid:#CACA2B;   --aqua:#7AC8CA;
  --red-dark:#991C22; --acid-dark:#A0A022; --aqua-dark:#56B9BB;
}
```

Generous whitespace, restrained motion, no drop shadows or gradients. The identity is flat, confident, and typographically driven.

---

## Voice and copy

Capsule writes like a smart person talking, not like an agency writing about itself. Confident, dry, a little irreverent, specific over grand. Concrete work beats adjectives — "we named a new apple cultivar" lands; "we deliver innovative solutions" does not.

**Voice traits**: direct, curious, wry, unpretentious, specific.

**Avoid**: agency filler ("synergy," "best-in-class," "leverage," "solutions provider," "passionate about"), inflated claims, and anything that could describe any other firm. If a sentence would survive a find-and-replace of the company name, rewrite it.

For any substantial copy, also apply the **`humanize-text`** skill — it holds Capsule's canonical banned-phrase list for AI tells.

### Approved boilerplate

**Short (deck standard)**
> Capsule is a special projects agency solving unique challenges in brand, design & marketing.

**Long (brand board)**
> Hi there. We're Capsule, a special projects agency that plays inside the gaps, outside the margins and beyond the limits of your average scopes of work in marketing, branding and design.

**Web**
> Capsule is a special projects agency helping brands solve better, connect deeper, and amplify their value.

### We are

A Custom Shop · Multidisciplinary · Project-Based · Networked · Change Navigators · Values-Driven · Industry-Agnostic

### Where we shine

- **Informed Design** — solving business challenges with human insight and creativity, via a custom process built per engagement
- **Creative Storytellers** — research, strategy, design and messaging with robust in-house capability
- **Diverse Experiences** — 25 years designing value across varied industries and unique challenges

### In-house capabilities

Research · Strategy · Identity · Naming · Messaging · Digital · Experiential · Packaging

### Facts

- Founded 1999. 25+ years. 1220 Marshall Street NE, Minneapolis, MN 55413.
- Brian Adducci, Creative Principal · Aaron Keller, Managing Principal
- Selected clients: Patagonia, Arc'teryx, Red Wing Shoes, Osprey, Hydro Flask, Smartwool, Herman Miller, 3M, Medtronic, Cargill, Blue Zones, Twin Cities PBS, Minnesota Orchestra
- capsule.us · info@capsule.us · 612.341.4525

### Naming

**Capsule** in running copy, **CAPSULE** in the wordmark and major display type. Not "Capsule Design," not "Capsule Agency," not "The Capsule."

---

## Client work

This skill is Capsule's *own* identity. When producing work **for a client**, the client's brand governs the artifact and Capsule's system stays out of it — apply Capsule styling only to the wrapper (cover, agenda, credentials, contact slides) unless asked otherwise. If a client-specific brand skill exists, that one wins for anything inside the covers.
