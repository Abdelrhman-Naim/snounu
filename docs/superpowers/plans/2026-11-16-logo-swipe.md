# Restaurant branding and banner gestures

Replace the decorative star in the admin sidebar, login brand and dashboard welcome card with MenuImage using the restaurant settings logo (bundled restaurant logo before authenticated settings are available). Preserve sidebar/mobile dimensions and dark/light contrast.

Extract BannerSlider with lightweight pointer gestures rather than adding another dependency. RTL track follows the drag; right swipe advances, left swipe goes back. Keep dot navigation, keyboard arrows, one-banner behavior and banner links. Horizontal gestures suppress accidental link clicks; vertical gestures retain scrolling through touch-action:pan-y pinch-zoom. Clamp at the ends and honor reduced motion.

Verify mouse and real touch events, opposite direction, dots/keyboard, vertical gestures, drag-versus-click, admin branding and existing UI tests. Build, review, push and verify production.
