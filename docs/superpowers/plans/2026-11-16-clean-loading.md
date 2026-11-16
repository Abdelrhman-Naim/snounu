# Clean loading and settings inputs

Remove only the Google Maps URL, latitude and longitude inputs from administration. Existing settings values and schema remain compatible.

The production SEO generator currently inserts plain fallback HTML inside the React root. Before CSS/JavaScript finish, that copy becomes visible. Keep the root empty for React, move the text fallback to noscript, and add a tiny critical inline spinner shown only while the JavaScript-enabled root is empty. Theme bootstrap marks scripting enabled before the body is parsed. Keep metadata/JSON-LD and the usable no-JavaScript text version.

Regression checks: block both JS and CSS on a production build and verify the body contains no visible fallback text; release assets and verify real products appear. With JavaScript disabled, verify the text fallback is visible. Verify removed settings inputs and the remaining form controls, build, deploy and repeat the slow-load test on production.
