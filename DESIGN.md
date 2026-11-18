---
name: htl-stock
description: Flat, square, ink-on-white till for a makerspace, following maakleerplek.be.
colors:
  wit: "#FFFFFF"
  beton: "#F1F0EC"
  beton-donker: "#E3E1DB"
  inkt: "#171717"
  grafiet: "#5B5C55"
  lijn: "#D8D7D1"
  lijn-zacht: "#E9E8E3"
  rood: "#B3261E"
  laser: "#A8401A"
  laser-licht: "#F6C9B4"
  cnc: "#34505E"
  cnc-licht: "#C9D3D8"
  openlab: "#CCDC9C"
  openlab-diep: "#4A5C22"
  workshop: "#CCDCF4"
  workshop-diep: "#2F4F85"
  herstel: "#ECB47C"
  herstel-diep: "#7F4A12"
  jongeren: "#C4B4E4"
typography:
  page-heading:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
  section-heading:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "1rem"
rounded:
  none: "0px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button:
    backgroundColor: "{colors.wit}"
    textColor: "{colors.inkt}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-primary:
    backgroundColor: "{colors.inkt}"
    textColor: "{colors.wit}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.wit}"
    textColor: "{colors.inkt}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.wit}"
    rounded: "{rounded.none}"
---

# Design System: htl-stock

## Overview
Flat and square. White and warm-grey (beton) surfaces, ink text, 1px grey rules, no shadows, no radius, no gradients. It copies maakleerplek.be on purpose. Colour carries meaning only: the muted agenda hues of the site (green add, red remove, blue set/info, amber volunteer, purple supplier), plus terracotta for the laser and slate for the CNC, matching their bands on the touch kiosk. Refinement work keeps this look.

## Colors
Defined as `@theme` tokens in `src/index.css`. Tailwind hues (`emerald`, `red`, `blue`, `amber`, `purple`, `sky`, `gray`) are remapped onto the site palette, so classes like `bg-emerald-400` give openlab green.
- Surfaces: wit (page, cards), beton (bands, table heads, hover), beton-donker (selected, pressed).
- Text: inkt, grafiet (secondary). Rules: lijn, lijn-zacht. Error: rood.
- Machines: laser (terracotta) and cnc (slate) with light fills; 3D print uses blue-600.
- A coloured tile is the light fill plus a 4px left (or top) border in the deep shade.

## Typography
Schibsted Grotesk 400-700 for everything, Literata only for long reading text, system mono for times, barcodes and per-unit prices. Sentence case, no uppercase except tags like "NEW" and the volunteer button. Page heading 2xl semibold, section heading base semibold, body sm, labels xs medium grafiet. Numbers in prices use `tabular-nums`.

## Layout
Stacked sections, each headed by a left-aligned strip (`px-4 sm:px-6 py-3 border-b border-lijn`). Cut cards sit in `grid-cols-[repeat(auto-fill,minmax(160px,1fr))]`; two per row on a phone or the laser side bar. Laser page is two columns from `lg`. Pay bars stick to the bottom. Touch targets are 44 px (`h-11`) in the cart.

## Elevation & Depth
None. Depth comes from rules (1px lijn, 2px for emphasis, 3px ink rule for active tabs and the laser-running strip) and from fill shifts (beton). Modals: ink at 50% overlay, white dialog with a lijn border. Hover is `brightness(0.96)`; press is a small scale-down.

## Shapes
Always square corners (`border-radius: 0`). Icons are lucide, 14 px inline, 16 px in buttons, 20-24 px in empty states.

## Components
- `brutalist-button`: white, 1px ink outline, font-medium; add a `bg-*` for a variant. `btn-primary`: solid ink, one per view. The checkout "Pay" button is the exception: openlab green fill (`bg-emerald-400`).
- `brutalist-input`: 1px lijn, ink on focus.
- `brutalist-card`: white, 1px lijn.
- Tabs: sm medium, inactive grafiet, active 3px ink underline.
- Cut card: 4:3 preview image on top, name and duration, price tag in green; ticked state is a 2px laser border with laser-licht tint; checkbox square top-left; "NEW" tag top-right.
- Machine tile: `border-t-4` in the machine colour, rate on the right, number input, green "Add to cart".
- Chips: tap-to-pick buttons, selected is blue-600.

## Do's and Don'ts
Do: use the tokens, keep 1px rules, keep sentence case, one ink primary per view, use meaning colours only for their meaning.
Don't: add radius, shadows or gradients; use hex values in components; use uppercase or wide tracking; introduce new accent hues.
Known drift: raw `#fee2e2`/`#d1fae5` in `ShoppingCart.tsx`, `text-[10px]` sizes, and the volunteer button using emerald-600 with a 2px border.
