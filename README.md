# Sharq Cargo Logistics

Bilingual Russian / Uzbek B2B freight-forwarding website for China–Uzbekistan shipments.

Public preview: https://nezamovrasul-boop.github.io/sharq-cargo-logistics/

## Active implementation

- `index.html`: semantic landing page, services, freight formats, business audiences, cargo categories, process, rate inquiry and contacts.
- `concept.css`: responsive design based on the approved November 14 concept. Message and primary action lead the hero; the map is secondary.
- `concept-content.js`: complete RU/UZ copy.
- `concept.js`: language switching, MapLibre/Turf schematic map, city suggestions, inquiry validation and WhatsApp review.
- `integrations-config.js`: public optional Umami configuration, inactive by default.
- `vendor/`: pinned local browser libraries and upstream licenses.
- `assets/`: local images, brand SVG and country geometry.

Run `npm ci` to restore development dependencies, `npm run check` for syntax, and `python3 -m http.server 61781` for local preview. GitHub Pages serves root files; no build is required. `npm run build:map` regenerates the compact Turf bundle.

## Inquiry behavior

The user enters contact details, goods, dimensions in centimetres, total volume and weight, packaging, route and transport. Unknown optional parameters are allowed. Additional packaging and dangerous-goods descriptions appear conditionally. The complete inquiry is reviewed on the page, then opened in WhatsApp; the user confirms sending there. There is no rate calculator, automatic transmission, backend storage or file upload.

Map selections and form cities are synchronized. Free-text cities remain allowed. Map paths connect city centres schematically and do not imply a real itinerary, warehouse location or live tracking. Reduced-motion preference disables route animation.

## Content limits

Illustrative logistics imagery is not represented as actual completed shipments or owned assets. Case studies are intentionally not published until real photos and verified details are supplied. A non-rendered HTML template reserves their structure. Offices, registration details and unverified metrics have not been invented.

## Previous implementation

The earlier `app.js`, `experience.js`, `improvements.js`, `route-planner.js` and associated styles remain in repository history / working files for reference, but are not loaded by the current page. Commit `123742b` is the previous published layout.

## Checks performed

RU/UZ translation coverage; all local assets; browser scenario from map and service selections through inquiry review; invalid contact and negative weight; custom packaging; dangerous-goods details and exclusion when hidden; language switching without losing entered values; safe text rendering; mobile widths 320 and 390; menu and keyboard flow. No test message was sent.
