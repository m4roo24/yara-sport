# Yara Sport - PWA Real App Setup

## Files Included

| File | Purpose |
|------|---------|
| `index.html` | Main app with PWA install system for all platforms |
| `manifest.json` | Web App Manifest (required for installability) |
| `sw.js` | Service Worker (offline support, caching, background sync) |
| `browserconfig.xml` | Windows tile configuration |

## How to Install on Each Platform

### Android (Chrome, Edge, Samsung Internet)
1. Open the website in Chrome/Edge
2. A bottom banner will appear saying "Install Yara Sport App"
3. Tap **Install** → App installs to home screen
4. Opens as standalone app (no browser UI)

### iPhone / iPad (Safari)
1. Open the website in Safari
2. A bottom banner shows: "Tap Share then 'Add to Home Screen'"
3. Tap the **Share button** (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **Add** in top right
6. App appears on home screen, opens standalone

### Windows (Chrome, Edge)
1. Open the website in Chrome or Edge
2. A bottom banner shows: "Install Yara Sport on Desktop"
3. Click **Install App**
4. App installs to Start Menu and Taskbar
5. Opens as standalone window (no browser bar)

### macOS (Chrome, Edge, Safari)
1. Open in Chrome/Edge: Click the install icon in address bar
2. Open in Safari: Go to **File → Add to Dock**
3. App appears in Dock, opens standalone

### Linux (Chrome, Edge)
1. Open the website in Chrome or Edge
2. Click install icon in address bar or use the banner
3. App installs to applications menu

## Required Icon Files (you need to create these)

Place these PNG files in the same folder:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` (used for Apple touch icon)
- `icon-384x384.png`
- `icon-512x512.png` (used for splash screen)
- `favicon.ico`

You can generate all icon sizes from one source image using:
- https://favicon.io/
- https://maskable.app/
- https://www.pwabuilder.com/imageGenerator

## Deployment

Upload ALL files to your web server or hosting (GitHub Pages, Netlify, Vercel, etc.)

**Important:** Must be served over HTTPS for PWA to work.

## PWA Features Active

- Standalone display mode (no browser UI)
- Offline caching via Service Worker
- Install prompt on Android/Desktop Chrome & Edge
- iOS Safari install instructions
- Background sync support
- Push notification support
- Auto-update detection
- Safe area insets for notched devices
