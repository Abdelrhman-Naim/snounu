# React + Firebase implementation plan

User explicitly directed execution and changed the stack: React, TypeScript, Tailwind, Firebase only, no custom backend or PostgreSQL. This supersedes the prior Next.js plan and database/password/session design. Execute now without another planning approval cycle.

- [ ] 1. Establish Vite React project and shared typed catalog contracts. Verify domain tests RED then GREEN; install cached dependencies offline if network unavailable.
- [ ] 2. Implement Firebase client/Auth/Firestore/Storage service and deny-by-default rules under snounu namespace. Public reads published content only; anonymous submissions keyed by authenticated UID; admin allowlist controlled in Console, never self-granted. Test rules against emulator separately.
- [ ] 3. Implement reference menu, welcome, breadcrumbs/detail, contact, favorites, themes, search/category intersection, loading/error/empty states and responsive RTL. Use local original Figma assets, never runtime temporary URLs.
- [ ] 4. Implement real admin CRUD for categories/products/ingredients/banners/settings, uploads, review moderation and private messages. Client validation improves usability; Firebase rules enforce permission/data integrity.
- [ ] 5. Add sitemap/robots/Restaurant/Menu/Breadcrumb metadata, static route snapshots at build where data available, Vercel SPA routing and deployment instructions. No invented geo or Google Maps registration claims.
- [ ] 6. Run unit tests, TypeScript, production build, rules emulator and browser checks as available. Report NOT RUN honestly. Review integration with fresh reviewer and fix important findings. Publish source to authorized empty GitHub repo via connector if native Git is blocked.

No own backend means rules can enforce per-UID cooldown and uniqueness, not reliable per-person identity or IP rate limits. Approved review averages are computed from approved public reviews, avoiding client-written aggregates. No private Firebase Admin key belongs in browser code; the supplied Admin snippet is a placeholder, not credentials. Firebase services/rules must be enabled/deployed by authenticated owner if no Firebase console connection exists.
