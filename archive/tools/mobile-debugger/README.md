# Solus Mobile Viewport Debugger (Archived Tool)

This tool was created to simulate and debug mobile responsive viewports (e.g., iPhone 15 Pro, iPhone SE, Pixel 8, iPad Mini), device rotations, outline overflow inspection, and native HUD metrics directly in the browser.

## Files
- `mobile-debug.css`: Styles for the left-edge toggle button, phone chassis frame, dynamic island, and inspector HUD.
- `mobile-debug.js`: Standalone script for the device presets, simulator iframe, layout outline toggling, and native mobile HUD.

## To Re-Enable During Future Development
1. Copy `mobile-debug.css` into `assets/css/` and add `@import url('mobile-debug.css');` to `assets/css/core.css`.
2. Copy `mobile-debug.js` into `assets/js/` and include `<script src="assets/js/mobile-debug.js"></script>` before `</body>` on any page you want to debug.
3. Click the red/dark `Mobile View` tab on the left edge of your screen, or press `Alt + M`.
