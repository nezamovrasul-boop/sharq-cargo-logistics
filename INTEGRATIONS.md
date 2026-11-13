# Installed integrations

Pinned npm versions and local browser distributions are committed. Run `npm ci` to restore development packages; `npm run check` validates application syntax. GitHub Pages serves the committed files without a build or CDN.

- autoComplete.js 10.2.10: active for origin/destination, Russian/Uzbek/English aliases. Free text remains allowed; suggestions do not guarantee service availability.
- libphonenumber-js 1.13.16: active optional phone field. Uses possible-number checks and international formatting; does not verify number ownership. Phone appears only in the user-reviewed WhatsApp inquiry.
- MapLibre: existing map retained.
- PhotoSwipe 5.4.4: installed, loaded only if real shipment gallery markup exists. Add a `[data-shipment-gallery]` container with anchors specifying `href`, `data-pswp-width`, `data-pswp-height` and accessible image descriptions. No generated imagery is represented as completed shipments.
- FilePond 4.32.14: installed in vendor/filepond; not exposed to visitors until a real upload service is configured. The helper below accepts a FilePond server adapter, avoiding any invented backend contract.
- Umami: prepared client integration, not a deployed analytics server. Set `umami.scriptUrl` (HTTPS) and `umami.websiteId` in integrations-config.js. No secret key belongs in this file. Tracks inquiry-start and whatsapp-open without phone, cargo description or documents. WhatsApp clicks are not confirmed submissions.

## File uploads: next setup

1. Choose an upload service with private storage, retention/deletion controls and server-side file size/type validation.
2. Provide a FilePond server adapter (`process` and `revert`) backed by that service; test upload, failure, cancellation and deletion.
3. Import `upload-adapter.js`, call `mountCargoUploader(input, serverAdapter, locale)`, and integrate returned file references with the actual inquiry backend. A wa.me link cannot attach local files.
4. Only then expose the upload field and explain where documents are sent. No production upload destination is currently configured.

## Licenses

Upstream license files are retained next to each distribution in vendor. The project package does not grant a new license to the site's brand or content.

## Route planner

Turf great-circle and bbox modules are bundled locally (7.4 KB) with `npm run build:map`. The route connects city centres schematically, never implies a real road/rail itinerary or tracking. Origin and destination selection is linked to the inquiry; unknown city input removes the line. Reduced-motion users see the final line without animation. City coordinates are approximate and not warehouse locations. MapLibre cooperative gestures protect page scrolling on touch devices. No routing API or geocoder account is required.
