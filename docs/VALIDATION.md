# Validation record

Stack: React + TypeScript + Tailwind + Firebase only. Previous Next.js/PostgreSQL documents are historical and superseded by the React plan and README.

Completed locally:
- TypeScript: tsc --noEmit passed.
- Unit tests: 16 passed (catalog filtering, admin validation, rating validation/aggregation, safe URLs, Arabic route decoding, JSON-LD and geo omissions).
- Production bundle: Vite build and SEO generator passed; no indexing enabled without final domain/catalog.
- Firestore rules: 6 tests passed against real local Firestore emulator, including unauthorized access, publication rules, review ownership/moderation, message cooldown and private messages.
- Browser tests: 13 passed, including review acknowledgement, mounted header search and Back, favorites/theme persistence, outbound URLs, six responsive widths, real admin login screen and malformed routes. Firebase network is mocked only for the acknowledgement UI test; Firestore security is independently emulator-tested.
- Independent code review found mounted-menu search, Arabic slug SEO and review acknowledgement bugs; fixed with regression checks. Malformed encoded paths now return 404 in the app.

Infrastructure findings resolved: cached npm dependencies were installed through an offline local cache registry; the cache-generated platform lock proved incomplete on Linux, so CI/Vercel resolve dependencies on their target platform and the downloadable source includes the generated lock. Node 24 is required by Firebase 13. Firestore emulator needed en_US JVM locale to avoid an Arabic-digit regex initialization error.

Not verified in this environment:
- Storage emulator rules (no Storage emulator installed).
- Live Firebase Auth, Firestore, Storage, App Check and Analytics: no authenticated Firebase Console connection; supplied web configuration does not establish enabled services or rule deployment.
- Real admin end-to-end writes/uploads on the production project; browser tests avoid changing real data.
- Full visual asset comparison locally: only the logo could be materialized. 48 original Figma assets were successfully downloaded by a read-only GitHub job into artifact 14163522040 on run 43718546160. Remaining original files are downloaded into public/assets during Vercel/CI setup, and must be retained with source after first download. No temporary Figma URLs are used as runtime image sources.
- Original custom Arabic font file was not supplied; current typography uses system Tahoma/Arial fallback.

No live Firebase rules deployment or Vercel publication was performed. The Firebase project name taskora-bf729 is exactly the owner-supplied project; Snounu data/rules use an isolated snounu_ namespace. Existing Taskora rules must be merged, not replaced blindly.

Known constraints: anonymous UID controls reduce spam but cannot identify a person/IP without a backend. SEO snapshots/sitemap require rebuilding after content changes. Vite reports a large initial Firebase bundle (~252 KB gzip); this is a performance improvement opportunity, not a failed build.

Automatic approval review rejected an earlier proposal for an Actions workflow with repository write permissions, and a later proposal to transfer public asset bytes through Actions logs. Neither was executed. The accepted asset job is read-only, outputs downloadable artifacts and cannot commit/push.


