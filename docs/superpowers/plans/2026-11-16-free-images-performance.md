# Free image uploads and faster menu

Goal: keep React/Firebase on the free tier, grant the supplied existing account administration, and reduce first-load JavaScript without changing the design.

Architecture: public catalog and image reads use the Firestore REST API. Firebase Auth and write SDKs load only for administration or submitting forms. Uploaded images live as immutable, admin-created WebP documents (maximum 180 KiB encoded) in snounu_images, referenced by firestore-image:<uuid>. Image documents are fetched on visibility and cached per session, never included in catalog queries. Existing HTTPS and local assets continue working.

Alternatives: paid Firebase Storage conflicts with the free-tier constraint; another image service would require a new account and upload policy. Small, separately fetched Firestore image documents fit a restaurant menu within Spark quotas. No billing upgrade or unlimited-use promise.

- [ ] Add failing tests for REST decoding/errors, managed image validation and image permissions.
- [ ] Implement REST catalog reader and lazy SDK wrappers; keep preview behavior and surface permission errors.
- [ ] Implement bounded WebP upload, lazy image resolution and admin previews; immutable images, no client collection listing, reject malformed/oversized payloads.
- [ ] Test rules, typecheck/build, existing browser flows, and browser-generated upload/preview.
- [ ] Grant the supplied email only after lookup in Firebase Auth; compare production transfer sizes before/after, deploy and test live.

Review: do not grant other accounts; never cache a failed image permanently; do not expose write access; preserve published-only queries; handle cancelled image loading and repeated submit correctly. Read-only GETs and a short-lived in-memory catalog promise avoid retaining deleted menu data across browser sessions. App Check configured deployments keep their SDK path.
