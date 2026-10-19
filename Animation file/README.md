# UNIHOPE motion system

## What this is, and what has not been checked
- A drop-in animation system: 1 CSS file, 2 hooks, 4 small components. Nothing else is installed (no animation library).
- I did NOT see your project. Paths use the `@/` alias and `src/`. Adjust them to your structure.
- The files were type-checked with TypeScript 5 against React 18 and React 19 types. They were not run in a browser. Use the test steps at the end.
- Tailwind version does not matter. The motion rules are plain CSS in `motion.css`.

## 1. Install (once)
1. Copy `src/styles/motion.css`, `src/hooks/*` and `src/components/motion/*` into your project.
2. In `app/layout.tsx`:
```tsx
import "@/styles/motion.css";
import { MotionInit } from "@/components/motion/MotionInit";

<html lang="en" suppressHydrationWarning>
  <head><MotionInit /></head>
  <body>...</body>
</html>
```
`suppressHydrationWarning` is needed because the script sets `data-motion` on `<html>` before React loads.

## 2. How it stays safe
- No JavaScript: the `data-motion` attribute is never set, so nothing is hidden.
- Reduced motion: everything is visible immediately and nothing moves (CSS and the hook both check it).
- No IntersectionObserver: content is shown immediately.
- App fails to hydrate: after 3 seconds a CSS failsafe shows everything.
- Only `opacity` and `transform` change. No horizontal movement, so no horizontal overflow and no layout shift.
- Durations: 500ms reveal, 300ms accordion, 150 to 200ms hover and selection.

## 3. Cheat sheet
| Need | Use |
|---|---|
| Hero text on page load | `className="anim-fade-up"` and `style={{ "--anim-delay": "80ms" } as React.CSSProperties}` |
| Hero image | `className="anim-fade-in"` (CSS only, no JavaScript, so it never delays the first paint) |
| One block on scroll | `<Reveal as="section">...</Reveal>` |
| Forms and large panels | `<Reveal variant="fade">` |
| Image then text | `<Reveal>` for the image, `<Reveal delay={100}>` for the text |
| Cards in a grid | `<RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" itemClassName="h-full">` and give each card `h-full` |
| List | `<RevealGroup as="ol" itemAs="li">` |
| Accordion panel | `<Collapsible open={isOpen} id={panelId} labelledBy={buttonId}>`, keep your own button |
| Button hover | `transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px motion-reduce:transform-none motion-reduce:transition-none` |
| Selected amount, payment tab | `transition-colors duration-150 motion-reduce:transition-none` |
| Input focus | `transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none` |
| Success message | render it only when the response really succeeded: `<div role="status" className="anim-fade-up">` |
| Table of contents | `const active = useActiveSection(ids)`, then `aria-current={active === id ? "true" : undefined}` and `transition-colors duration-200` on each link |

Card hover lift (the Stitch cards use `hover:-translate-y-1`) stays on the card. `RevealGroup` wraps each card, so the two transforms never collide.

## 4. Page by page
| Page | Add |
|---|---|
| Home | Hero H1 and paragraph `anim-fade-up` (paragraph delay 80ms). Hero image `anim-fade-in`. Eight focus cards in a `RevealGroup`. Story: image `Reveal`, text card `Reveal delay={100}`. Join panel `Reveal`, button hover classes. **Impact statistics: skip.** There are no verified numbers, and the trust strip values ("2026", "10") must stay static. A count-up from 0 to 2026 would look wrong |
| About Us | Hero `anim-fade-up`. Vision panel and Mission each in a `Reveal as="section"`. Principles list in `RevealGroup as="ol" itemAs="li"`. Founder: portrait and text as two `Reveal`s. Closing CTA `Reveal`. Team grid in a `RevealGroup` (not requested, optional) |
| Our Work | Intro `anim-fade-up`. The ten pillars: one `Reveal` around the heading block, then `Collapsible` in each row. Do not reveal each row. CTA `Reveal`. The brief mentions related-work cards, but the current design has none |
| Donate | Intro `anim-fade-in`. Form card one `Reveal variant="fade"`. Amount buttons and payment tabs use the selected-state classes. FAQ rows use `Collapsible`. Do not animate the Donate button |
| Get Involved | Hero `anim-fade-up`. Four cards in a `RevealGroup`. Partner form `Reveal variant="fade"`. Success card `anim-fade-up` only after a real success. Volunteer registration is the external Google Form, so only the partner form has a success state |
| Contact | Three contact cards in a `RevealGroup`. Form `Reveal variant="fade"`. Input focus classes. Map: nothing. Confirmation `anim-fade-up` after real success |
| Privacy, Terms | Heading `anim-fade-in`. `useActiveSection` for the contents list. Nothing on paragraphs. Add `scroll-mt-24` to each section heading so links land below the sticky header |
| Health & Humanitarian Support | Only if you keep this page: hero `anim-fade-up`, cards `RevealGroup`, CTA `Reveal` |

## 5. Before you start
- The Stitch export for Our Work showed pillars 01 to 08 missing in the screenshot. The export has no scroll-reveal code, so check the layout of that section first. Do not add animation on top of a section that does not render.
- `Reveal` uses `transform` until visible, then `transform: none`. Do not put a `Reveal` around an element that must be `position: sticky` while it is still hidden (the contents sidebar). Reveal its parent heading instead.
- Padding inside an accordion panel goes on a div inside `Collapsible`, not on `Collapsible` itself.
- If an existing accordion uses `<details>`, leave it as it is.

## 6. Test steps
1. **Desktop and mobile:** Chrome DevTools, device toolbar at 1440, 768 and 390. Scroll slowly. Items appear once, nothing jumps, no horizontal scrollbar.
2. **Reduced motion:** DevTools, three-dot menu, More tools, Rendering, "Emulate CSS prefers-reduced-motion: reduce", reload. Everything is visible at once and nothing moves.
3. **No JavaScript:** Command menu (Ctrl+Shift+P), "Disable JavaScript", reload. All content visible.
4. **Failsafe:** Network tab, right-click a `_next/static` JavaScript chunk, "Block request URL", reload. After about 3 seconds all content appears.
5. **Slow device:** Performance, CPU 4x slowdown, reload. Hero text still appears.
6. **Layout shift:** Lighthouse, check Cumulative Layout Shift stays near 0.
7. **Keyboard and screen reader:** Tab through accordions. Closed panels are skipped. Enter and Space still toggle. Focus rings still show on inputs.
8. **Success state:** submit a real form and confirm the message appears only after a successful response.
