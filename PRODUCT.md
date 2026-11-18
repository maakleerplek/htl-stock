# Product

<!-- impeccable:product-schema 1 -->

<!-- Written from README.md, MOONSHOT.md, STYLING_GUIDE.md, CLAUDE.md and the user's brief. No interview was held (inferred, not confirmed). Unknowns are marked [unknown]. -->

## Platform

web

## Users
Two groups. This work focuses on the first.

- **Visitors** of the High Tech Lab (HTL), a makerspace (maakleerplek). They take material, use machines (laser, CNC, 3D printer) and pay for material plus machine time. They use the app on the touch kiosk, on their own phone, or in the side bar next to LightBurn on the laser PC. Many have never seen the page before. [unknown: share per device, typical visit length, language mix]
- **Volunteers** (Authentik sign-in): stock changes, new parts, purchase orders, data repair, analytics. Volunteers can also book free "volunteer / workshop" use.

## Product Purpose
Stock and checkout app of the HTL, on top of InvenTree. A visitor scans items (USB scanner or camera), adds machine time and pays with an EPC (Wero) or Payconiq QR code. Every sale becomes one InvenTree sales order on "Walk-in customer". The laser page shows each cut the laser made (timed by an ESP32 sensor), so a visitor ticks their own cuts and pays for them at the checkout. Success: a visitor pays the right amount without asking a volunteer, and the stock and machine-time books stay correct.

## Positioning
Not a webshop. It is the till of one physical space, tied to that space's hardware: a laser-on sensor that turns time into cuts with LightBurn previews, a barcode scanner, a kiosk and the shop's own pricing rules (machine minimum per payment, volunteer use at EUR 0).

## Operating Context
- Surface mode: Operate (a tool used to finish a task, not a page to browse).
- Devices: kiosk touch screen (htl-kiosk is a separate Rust app; this web app also runs on the kiosk at 10.72.1.246:8086), visitors' phones, the narrow Laser Timer side bar on the laser PC (Windows, Tauri wrapper around `#laser`), volunteer desktops.
- Network: maakleerplek network only (stock.int.maakleerplek.be).
- The laser PC side bar and phones are narrow; cuts show as a grid of cards, two per row.
- Pricing and checkout rules live only in `core/checkout.py`; the UI shows the server's bill.
- Payment is outside the app: the visitor pays through their bank app from the QR code. The app cannot see whether the payment arrived [unknown: whether any confirmation exists].

## Capabilities and Constraints
- Scan or tap items into a cart; type minutes (laser, CNC) or grams (3D print) by hand; tick laser cuts, optionally group them in projects; pay at the checkout.
- Machine minimum applies once per payment, for all machine use together.
- VOLUNTEER / WORKSHOP makes the cart free, with a confirmation that it is for volunteers only.
- Receipt PDF on request after payment.
- Stack: React 19, TypeScript, Vite, Tailwind v4, lucide-react, framer-motion. Language is English in the UI; Dutch design tokens (`lijn`, `grafiet`). [unknown: whether a Dutch UI is wanted]
- Max about 400 lines per file; one feature per folder in `src/features/`.
- Production deploy is push to master; no PRs. UI changes go through the test server first.
- In flux (another agent): in-page laser payment, drag-to-project hints, per-project grouping in Extras.

## Brand Commitments
Follows the look of maakleerplek.be (see STYLING_GUIDE.md). HTL cube logo as favicon on an ink square. Nothing else confirmed.

## Evidence on Hand
- Screenshots: `docs/checkout.png`, `docs/laser.png`.
- No usage numbers, user research, accessibility audit or testimonials in the repo. Do not invent any.

## Product Principles
1. A visitor with no help must reach "paid" from any entry point (scan, laser cut, typed time).
2. Show the server's price, always with the reason when it differs from the simple sum (minimum, rounding).
3. Money and destructive actions are never one accidental tap away, but never slower than the 2-second read lock already used.
4. Volunteer tools stay out of the visitor's way.
5. It must work at arm's length on a kiosk and in a 300 px side bar.

## Accessibility & Inclusion
No standard stated. Touch targets of 44 px already used in the cart. [unknown: required WCAG level]
