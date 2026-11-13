# Installed integrations

Active page: `concept.js`, `concept-content.js`, `concept.css`.

- **MapLibre**: local map renderer with cooperative gestures and accessible city controls. Coordinates indicate city centres, not company facilities.
- **Turf great-circle / bbox**: local compact bundle `vendor/route-geometry.js`. Build using `npm run build:map`. Paths are schematic.
- **autoComplete.js 10.2.10**: active origin/destination suggestions; RU, UZ and English aliases; free text allowed.
- **libphonenumber-js 1.13.16**: active possible-number validation and formatting. The contact field accepts a phone or Telegram username; it does not verify ownership.
- **FilePond 4.32.14**: installed but not loaded on the current page. `upload-adapter.js` is a prepared adapter requiring real server `process` and `revert` handlers. Do not expose uploads without storage, retention and server-side validation. A wa.me link cannot attach local documents.
- **PhotoSwipe 5.4.4**: installed, inactive until real case-study images are supplied and a gallery is connected.
- **Umami**: client hook prepared, no server deployed. Set public `umami.scriptUrl` (HTTPS) and `umami.websiteId` in `integrations-config.js`. Never put secrets there. Configured tracking includes inquiry-start and whatsapp-open, without contact, goods or document data. A WhatsApp click is not proof of a submitted inquiry.

Pinned versions are in package-lock.json. Restore using `npm ci`. License files are preserved with local distributions. There are no CDN dependencies in the active page.
