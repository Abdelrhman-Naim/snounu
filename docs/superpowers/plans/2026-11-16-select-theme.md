# Selects and shared appearance

Use @radix-ui/react-select for all three native selects: contact kind, product category, message status. Preserve RTL, labels, required/disabled states, form values and reset. Load the contact select lazily so the menu keeps its small entry bundle.

Keep a single ThemeProvider above public/admin routes. Both toggles share validated light/dark state and the existing localStorage key, with an early document theme bootstrap to avoid flashing. Increase light-theme text/border contrast; style dropdown portals and admin status/error states through theme tokens.

- Test contact mouse/keyboard choice and form reset; native select is no longer visible.
- Test persisted theme on direct admin entry, toggle, reload and return to menu.
- Test portal contrast and horizontal fit at mobile/desktop sizes in both themes.
- Test actual admin category/status controls, required/disabled handling, and preserve existing browser flows.
- Build, review, push to main, deploy and verify production.
