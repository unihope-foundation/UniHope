# UNIHOPE Donate page: Next.js, React, TypeScript, Tailwind

One responsive page. No separate desktop and mobile versions.

## Files
```
app/donate/page.tsx                 server component: layout and sections
components/donate/DonationForm.tsx  client component: amounts, fields, payment tabs, validation, thank-you state
components/donate/DonateFaq.tsx     client component: accessible accordion
content/donate.ts                   all text, icons and FAQ in one place
lib/donations.ts                    types, rupee formatter and the submitDonation() stub
```
The Header and Footer are not included. They come from your root `layout.tsx`.

## Setup
1. `npm i lucide-react` (icons; the export's inline SVGs were replaced).
2. Copy your hero photo to `public/images/donate-hero.jpg` and update the `alt` in `content/donate.ts` so it describes the real picture.
3. The `font-outfit` class must exist. Tailwind v3 (`tailwind.config.ts`):
   `theme: { extend: { fontFamily: { outfit: ["var(--font-outfit)", "sans-serif"] } } }`
   Tailwind v4 (`globals.css`): `@theme { --font-outfit: var(--font-outfit), sans-serif; }`
   Body text uses your layout's Plus Jakarta Sans.
4. The Privacy Policy link goes to `/privacy-policy`. Change it in `DonationForm.tsx` if your route differs.
5. If your imports do not use the `@/` alias, replace `@/` with relative paths.

## Payment is not connected
`submitDonation()` in `lib/donations.ts` throws on purpose. The form therefore shows the error message and never a fake thank-you. Replace its body with your payment provider or an API route. The thank-you card appears only when it resolves with a `referenceId`.
The UPI ID, QR code and bank details are marked "[to be added]".

## Responsive behaviour
| Area | Mobile | Tablet | Desktop (lg, 1024+) |
|---|---|---|---|
| Hero layout | One column: heading, photo, form, commitment card | Same | Two columns: heading, photo and commitment on the left, form on the right |
| Photo height | h-56 | h-72 | h-80 |
| H1 | 36px | 48px | 56px |
| Email and phone | Stacked | Side by side | Side by side |
| Amount buttons | Wrap onto lines | Wrap | Wrap |
| Donate button | Sticks to the bottom of the screen while the form is in view | Same | Normal position |
| Trust cards | 1 column | 3 columns from md | 3 columns |
| FAQ | Full width | 840px max | 840px max |

## Changes from the pasted export
- Removed the orange ribbon (your rule: Home only).
- Removed absolute positions and fixed widths (`w-[552px]`, `left-[600px]`) and fixed the broken shadow classes.
- Replaced the decorative fake QR (about 20 SVGs) with a labelled placeholder box.
- Static boxes became real controls: buttons, select, inputs, checkboxes and a radio-style payment switch, with labels, error messages and `aria` attributes.
- The sample values "Anandhi Sundaram", "anandhi@example.com" and a phone number became placeholders.
- The three label "buttons" in the trust cards are now plain text.
- Wording changed (edit `content/donate.ts` to revert):
  * "100% Direct Allocation" became "Direct allocation".
  * "Governed by Indian Trusts Act" became "Registered charitable trust". The act is not confirmed by the client and the 1882 Act normally applies to private trusts.
  * "Chennai North Jurisdiction" became "Registered 2026".
  * "Legally Registered Public Trust" became "Registered Charitable Trust".
  * FAQ answers 2 to 6 are "[Answer to be confirmed by UNIHOPE]" because the export had none.

## What was checked
TypeScript strict type check passed, and `next build` (Next.js 14, React 18) compiled and prerendered `/donate`. Not checked: appearance in a browser, Tailwind output, keyboard use or real payments. Test at 390, 768 and 1440 against your Stitch design.

## Animation
Not added here. When you want it, use the animation system: `Reveal` around the form card, `Collapsible` for the FAQ panels, and the selected-state classes are already on the amount buttons and payment tabs.
