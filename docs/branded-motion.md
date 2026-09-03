# AM Network landing design

The landing page leads with a split composition: a short product message and waitlist action beside a woven orbital network. The secondary whitepaper link stays separate from the primary actions. AI assessment, human verification, and blockchain transparency replace the oversized market statistics in the hero. Market figures remain in their supporting sections.

The three illustrative components share one restrained visual language:

- The hero uses a slowly moving toroidal mesh with three traveling highlights around the official circular AM emblem. There is no enclosing card or ivory logo plaque.
- The giving path follows five stages, matching the detailed explanation: giving, AI assessment, human review, blockchain transfer, and proof. Thin paths replace the floating cubes.
- The receipt is a stable document with a compact brand header, a sample amount matching the illustrative story, and an explicitly non-transactional demo identifier. Its decorative barcode and orbit have been removed from view.

The source `/logo.webp` is unchanged. A circular CSS viewport displays the existing emblem portion without repainting or recoloring the artwork. Navigation pairs it with a readable text wordmark. Sans-serif headings, consistent spacing, quieter product cards, and reduced emoji decoration connect the hero to the rest of the page. The market clock now sits with market context; the illustrative urgent case sits with scoring content.

## Implementation

`assets/am-design.css` inherits the site's theme variables. `assets/am-motion.js` is dependency-free, uses DOM text for labels, and performs no API, payment, wallet, or analytics operations. Copy follows the site's existing nine language choices, including Tajik's `tg` HTML language and Arabic RTL. The new hero message describes the platform as being built. Receipt text direction follows the selected language.

Each animation runs once for twelve seconds. Replay is explicit; pause preserves progress. No frames are scheduled while a component is off-screen or the document is hidden. Canvas pixel density is capped at 2. Reduced-motion visitors receive a static end state and can explicitly request playback. Controls are native buttons, and status announcements only change at meaningful steps.

Version the asset query strings and service-worker cache together when updating these files. The new assets are included in the offline cache. The old simulated ledger and its animation loop have been removed.

## Validation

- Syntax checked for the motion script, main translations, service worker, and inline scripts in the affected pages.
- Browser checks covered play/pause, language changes, reduced-motion opt-in, dark/light themes, Arabic RTL, and component layout at 320px, 360px, and 1280px viewport widths. The mobile navigation, five-stage labels, hero and receipt contents fit their containers. Earlier checks also covered receipt collapse/expand and logo loading.
- The interactive preview reuses the actual component markup, CSS, JavaScript and original logo. Preview theme colors are resolved before use in Canvas.
- Screenshot capture was unavailable in the browser connection; layout verification used DOM geometry and interaction checks.

The same change also corrects certification status, pre-launch application expectations, and the calculator's waitlist CTA across all nine languages. It does not add live transfers, applicant decisions, or market-price feeds.
