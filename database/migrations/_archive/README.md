# Archived migrations

These predate the migration runner and **do not match the live database**.
They are kept only for history — the runner (`database/migrate.mjs`) ignores this folder.

- `001_initial_schema.sql` — original `resources` / `learning_paths` / `path_nodes`
  sketch. The live `resources` table has a very different column set, and
  `learning_paths` / `path_nodes` were never created (the live DB uses `user_paths`).
- `002_rename_bluesky_to_reddit.sql` — **never applied, and no longer valid.**
  The live `user_profiles` still has `x_url` / `personal_website` (mapped to
  `twitter_url` / `website_url` in code by `apps/api/src/lib/profileFields.ts`),
  and already has `reddit_url`. Running this migration would fail on the
  missing `bluesky_url` column.

The authoritative baseline is `database/schema.sql` (a snapshot of the live
Supabase schema). Numbered migrations from `003` onward apply on top of it.
