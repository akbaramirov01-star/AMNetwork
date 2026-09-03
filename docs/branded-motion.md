# Branded motion on the landing page

The landing page uses three independent, illustrative components:

- The hero network unfolds from an eight-point geometric pattern around the existing AM Network logo.
- The giving path animates four overview stages, with AM Network embedded in the blockchain stage. The detailed five-step explanation remains below it.
- The receipt beside the illustrative story uses the same official logo, a sample amount matching the story, and an explicitly non-transactional demo identifier.

The original `/logo.webp` is placed intact. Its artwork and colors are not modified. An ivory backing keeps the complete wordmark legible in both site themes.

## Implementation

`assets/am-motion.css` inherits the site's theme variables. `assets/am-motion.js` is dependency-free, uses DOM text for labels, and performs no API, payment, wallet, or analytics operations. Copy follows the site's existing nine language choices, including Tajik's `tg` HTML language and Arabic RTL.

Each animation runs once for twelve seconds. Replay is explicit; pause preserves progress. No frames are scheduled while a component is off-screen or the document is hidden. Canvas pixel density is capped at 2. Reduced-motion visitors receive a static end state and can explicitly request playback. Controls are native buttons, and status announcements only change at meaningful steps.

Version the asset query strings and service-worker cache together when updating these files. The new assets are included in the offline cache. The old simulated ledger and its animation loop have been removed.

## Validation

- Syntax checked for the motion script, main translations, service worker, and inline scripts in the affected pages.
- Browser checks covered play/pause, language changes, reduced-motion opt-in, light theme, Arabic RTL, collapsed/expanded receipt, successful logo loading, and component overflow at 360px and 1280px viewport widths.
- No browser console errors were reported during these checks.
- Screenshot capture was unavailable in the browser connection; layout verification used DOM geometry and interaction checks.

The same change also corrects certification status, pre-launch application expectations, and the calculator's waitlist CTA across all nine languages. It does not add live transfers, applicant decisions, or market-price feeds.
