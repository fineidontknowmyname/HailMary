# HailMary — Full Codebase Audit

**Scope:** `apps/web`, `apps/api`, `pipeline`, `packages/types` — excluding `node_modules`, build output, lockfiles.
**Method:** Static review + tools actually run where noted (ESLint, `tsc`, `vite build`), not just inspection. No files were modified during this pass.

Every finding below is backed by a real file/line or a real command output — nothing here is inferred without a citation you can check yourself.

---

## 1. Visual / Design Consistency

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| `apps/web/src/pages/Portfolio.css` (1077 lines) | An entire second, fully-built portfolio design system (gold/blue accent, Fraunces/Space Mono fonts, its own hero/experience/projects/skills/contact sections) that is **never imported anywhere** — confirmed via repo-wide grep for the filename. | High | Delete. This is dead weight, not a fallback. |
| `apps/web/src/components/AuthModal.tsx`, `DynamicAssessment.tsx`, `ExternalResourceCard.tsx`, `components/tutorial/*` (4 files) | Fully hardcoded hex colors (`#4fffb0`, `#7a849a`, `#1e2535`, etc.), no theme integration — because these components are unreachable dead code (see §3), they never got migrated when the rest of the app moved to the token system. | Medium | Delete alongside the dead-code cleanup in §3, rather than migrate unreachable code. |
| `apps/web/src/pages/PublicProfileView.tsx` (37 hardcoded colors) | Runs its own independent color system (`INDIGO`/`LIME` constants) and its own light/dark toggle, completely separate from `lib/theme.ts`/`ThemeProvider`. | Low (by design) | This was a deliberate choice — the public portfolio is meant to be a distinct personal-brand identity, not reuse the app's cyan/black theme. Flagging only so it's not mistaken for drift; no action needed unless you want one unified system. |
| `apps/web/src/components/AssessmentEngine.css` (59 hardcoded colors) | Its own CSS-custom-property token system (`--ae-accent`, `--ae-bg`, etc.), separate mechanism from the React-context `lib/theme.ts` system used everywhere else — necessary because it's a large pre-existing hand-written stylesheet, but it means "the theme" is defined in two different places using two different mechanisms. | Medium | Acceptable as-is for now; worth noting if `AssessmentEngine` is ever rewritten as JSX-driven, at which point it should fold into `lib/theme.ts`. |
| Filter chips / status badges, various | Semantic status colors (project "Finished" = blue, in `IncubatorPage.tsx:31-35` and `ProjectModal.tsx:200`) intentionally differ from the cyan brand accent to distinguish states, similar to how "Ongoing" ≠ "Finished" needs to be scannable. | Low | Judgment call — confirm you're fine with this being an intentional exception to "one accent everywhere," not an oversight. (The blue-vs-cyan *interactive/active-state* inconsistency you flagged separately has already been fixed in `FilterBar`, `ChallengeModal`, and `ResumeControlPanel`.) |
| App-wide | No documented spacing scale — padding/margin/radius values are ad-hoc Tailwind utility values (`px-5`, `py-2.5`, `gap-3`, etc.) chosen per-component rather than drawn from a shared scale. | Low | Normal for Tailwind-based projects; only worth formalizing if inconsistency becomes visible in practice. |
| Fonts, app-wide | Three separate type systems currently exist: main app (Roboto/Lato/Playfair Display via `lib/theme.ts`), `PublicProfileView` (Sora/Manrope), and the dead `Portfolio.css` (Fraunces/Space Mono). | Low | Two of the three are either intentional (`PublicProfileView`) or dead code being removed — not a live inconsistency once §3's cleanup happens. |

---

## 2. Code Structure & Consistency

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| 8 frontend files call `supabase.from(...)` directly (`IncubatorPage.tsx`, `ProjectModal.tsx`, `ResumeControlPanel.tsx`, `ResumeBuilder.tsx`, `PortfolioPage.tsx`, `ContributeResource.tsx`, `PublicProfileView.tsx`, `DynamicAssessment.tsx`) while the dashboard/AI features go through `lib/api.ts` → Express | Two parallel, inconsistent data-access patterns in the same app: one path is authorized by Express's `requireAuth` (visible in code), the other is authorized only by Supabase RLS policies (invisible — they live outside this repo and were not verified as part of this audit). | High | Architectural decision, not a quick fix — documented at length in the earlier full-app audit. Worth a deliberate call on whether direct-Supabase access is acceptable long-term or should be routed through the API. |
| `apps/web/src/**/*.tsx` | 22 occurrences of `: any` / `as any` across 14 files (`ResumeControlPanel.tsx` ×5, `DynamicAssessment.tsx` ×3, `ChallengeModal.tsx` ×2, others ×1) | Medium | 8 of these are hard ESLint errors right now (see §6) — `no-explicit-any` is configured but not being enforced in CI/practice. |
| `apps/web/src/pages/IncubatorPage.tsx` (project delete handler) | `await supabase.from('hailmary_projects').delete().eq('id', project.id)` — return value's `error` is never checked. If the delete silently fails (RLS denial, network blip), the UI removes the card from local state anyway, so the user believes it's deleted when it isn't. | Medium | Destructure and check `error`; surface a toast/inline message on failure instead of optimistically assuming success. |
| Error handling, app-wide | Mixed patterns: some async handlers use try/catch with a dedicated `error` state (`SessionManager`, `ResumeControlPanel`), others swallow errors into `console.error` only, others (like the IncubatorPage case above) don't check at all. | Medium | No single fix — worth a pass to standardize on "every Supabase/fetch call checks its error and surfaces it to the user," since the codebase already has the UI patterns (`InlineError`, error state) in most places, just not applied uniformly. |
| Whole repo | Zero test files found anywhere in the repo (`apps/web`, `apps/api`, `pipeline`). `DEPLOYMENT.md` documents a CI step `pnpm run test`, but there is nothing for it to run. | Medium | Either the CI step is a no-op today, or it's failing — worth confirming which, since the docs claim test coverage gates deploys. |
| File naming | Components are consistently `PascalCase.tsx`, hooks/utilities consistently `camelCase.ts` — genuinely consistent, no violations found. | — | No action needed; noted because the prompt asked. |
| Styling approach | Mix of Tailwind utility classes, heavy inline `style={{}}` props (the theme-driven pattern used throughout this session's work), and three standalone `.css` files (`AssessmentEngine.css`, `AppRouter.css`, the dead `Portfolio.css`) with no documented rule for when a component gets its own stylesheet vs. inline styles. | Low | Not urgent; the inline-style-driven-by-theme-object pattern is now the dominant one and works, just isn't written down anywhere as "the convention." |

---

## 3. Performance & Efficiency

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| `apps/web/src/pages/IncubatorPage.tsx:252`, `apps/web/src/pages/ProfilePage.tsx:109` | **Confirmed by running ESLint directly** (`react-hooks/set-state-in-effect`): both call `setState` synchronously in the body of a `useEffect`, which the React team's own lint rule flags as causing cascading re-renders. | Medium | Restructure so the early-return state update happens outside the effect body where possible, or split into two effects per the rule's guidance. |
| App-wide | `@tanstack/react-query` is a listed dependency but has **zero usages** anywhere in the codebase (confirmed via grep for `useQuery`/`useMutation`/`QueryClient`). Every page fetches its own data independently with no caching — e.g. `PortfolioPage.tsx` and `PublicProfileView.tsx` both fetch profile data on every navigation with nothing shared between them. | Medium | Either actually adopt React Query (it's already a dependency, install cost is sunk) for the pages that repeatedly fetch the same data, or remove the unused dependency if there's no plan to use it. |
| `apps/web/package.json` | `axios` is a dependency with **zero usages** anywhere in `apps/web/src` (confirmed via grep) — the app exclusively uses `fetch` via `lib/api.ts`. | Low | Remove the dependency; it's dead weight in the install and lockfile. |
| Build output (`vite build`, this session, repeatedly) | Main JS chunk is consistently ~2.18MB (694-704KB gzipped) with Vite's own warning to code-split. No `dynamic import()` used anywhere for route-level splitting — every page (Assessment Engine, PDF resume renderer, all modals) ships in one bundle regardless of which route is visited. | Medium | Route-level `React.lazy()` + `Suspense` for at least the heaviest pages (`AssessmentEngine`, the `@react-pdf/renderer`-based Resume Builder) would meaningfully cut initial load. |
| `apps/web/favicon.jpg` | 314.51 KB for a favicon (visible in every build output this session). | Low | Trivial fix — compress or convert to a proper multi-size `.ico`/small `.png`; should be a few KB. |
| Dead code, confirmed unreachable via grep (no imports found anywhere) | `AuthModal.tsx`, `navigation/TopNav.tsx`'s actual render path (defined + exported, never mounted — `AppLayout.tsx` has its own duplicate inline header instead), `DynamicAssessment.tsx`, `ExternalResourceCard.tsx`, all of `components/tutorial/*` (4 files), `apps/api/src/services/pathEngine.ts` and `scorer.ts` (hardcoded-return stubs, never imported by any route), the entire `pipeline/` package (scrapers/fetchers exist but the scheduler never calls them — confirmed in the original audit and still true). | Medium | All safe to delete — none are reachable from any route or entry point. This is the single largest "free" cleanup available in the repo. |
| `apps/web/src/components/AITutorPanel.tsx` | No distinct error UI state — network/API failures are appended into the chat transcript as a fake assistant message rather than shown as a genuine error state. | Low | Minor UX inconsistency with how every other converted component (dedicated `error` state + `InlineError`-style UI) now handles failures. |
| N+1 / redundant fetches | `ResumeBuilder.tsx` correctly parallelizes its 4 fetches via `Promise.all` — **this one's done right**, noted as a positive example, not a finding. | — | No action. |

---

## 4. Auth & Security

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| 8 frontend files bypassing the Express API (see §2) | Authorization for these paths depends entirely on Supabase RLS policies, which live outside this repository and were **not** verified as part of a source-code-only audit — meaning this audit cannot confirm whether they're actually safe, only that the trust boundary is inconsistent with the rest of the app. | High | Get the RLS policies for `hailmary_projects`, `hailmary_education`, `hailmary_experience`, `user_profiles`, and `resources` reviewed directly (e.g., via the Supabase dashboard/SQL), since this audit's scope couldn't reach them. |
| `apps/web/src/components/ContributeResource.tsx` | Public, unauthenticated `insert` into the `resources` table (status: `'pending'`) with no CAPTCHA, no rate limit, no auth check — relies entirely on RLS to prevent spam. Already flagged in an earlier pass of this project; still true. | Medium | Same recommendation as above — verify the RLS policy actually restricts what an anonymous insert can set, and consider adding basic abuse protection (rate limit, honeypot field). |
| `.env` files | Correctly gitignored per `DEPLOYMENT.md`; local `.env` files contain real keys but are not committed. This audit did not scan git history for historically-committed secrets — that's outside "current source files" scope as specified. | — | If you want that checked, it's a separate ask (`git log -p` / a secrets-scanning tool over history, not the working tree). |
| `apps/api/src/routes/*` | Auth checks are now consistent — every route group correctly applies `requireAuth` except the intentionally-public `intel.routes.ts` (read-only) and `portfolio.routes.ts` (intentionally public by design). Verified by direct inspection of all 7 route files. | — | No action — noted as a positive finding since the prompt specifically asked to check for consistency here, and the earlier work in this project explicitly fixed the one route group that used to skip this. |
| `apps/web/src/pages/IncubatorPage.tsx` delete handler | Same finding as §2 — a failed Supabase call is treated as success, which in a security context also means a failed *authorization denial* (RLS blocking the delete) would be silently misreported to the user as "deleted." | Medium | Same fix as §2 — check and surface the `error`. |

---

## 5. Accessibility

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| `ChallengeModal.tsx`, `DoubtSolverModal.tsx`, `AITutorPanel.tsx` close buttons | Icon-only close buttons (`<X className="..." />` / `✕` glyph inside a `<button>`) with **no `aria-label`** — a screen reader announces these as unlabeled buttons. | Medium | Add `aria-label="Close"` (or more specific, e.g. `"Close doubt solver"`) to each. Quick, mechanical fix across ~3 files. |
| `ChallengeModal.tsx`, `DoubtSolverModal.tsx`, `MFAChallenge.tsx`, `SessionManager.tsx`, `AITutorPanel.tsx` | No `Escape`-to-close handler and no focus trap — contrast with `SignInModal.tsx`, `ProjectModal.tsx`, and `UpdatePasswordModal.tsx`, which do implement `keydown`-based Escape handling. Inconsistent keyboard support across what are otherwise the same class of component (modal). | Medium | Extract the existing Escape-handling `useEffect` pattern (already written correctly in `SignInModal`/`ProjectModal`) into a shared hook (e.g. `useEscapeToClose(onClose)`) and apply it to the remaining five modals — this is also a §2 "duplicate logic that should be a shared hook" finding. |
| Color contrast | Addressed for the main app shell/dashboard/modals in this session's design-consistency pass (borders and muted text darkened for light mode). Remaining lower-confidence areas: `AssessmentEngine.css`'s small alpha-tinted badges (difficulty/status pills) were not individually contrast-checked against both themes. | Low | Spot-check the difficulty/status badges in `AssessmentEngine.css` with a contrast checker if this component sees real usage. |

---

## 6. Dependencies & Config

| File/Location | Issue | Severity | Suggested Fix |
|---|---|---|---|
| `apps/web` — **ran `npx eslint .` directly** | **Currently fails with 28 errors** (26× `no-explicit-any`, 2× `react-hooks/set-state-in-effect`). `DEPLOYMENT.md` states CI runs `pnpm run lint` and halts deployment on failure. | High | Either CI is currently red on every push, or the lint step isn't actually gating merges in practice — worth confirming which is true, since the documentation and the actual repo state disagree. |
| `pipeline/package.json` | Has a `"lint": "eslint src"` script, but **no ESLint config file exists** anywhere in `pipeline/` — running it would fail immediately with "no config found," not lint errors. | Medium | Either add a config (can extend the same flat config pattern as `apps/web`) or remove the misleading script. |
| `apps/api/` | No ESLint config or lint script at all — the only workspace of the three with zero lint enforcement. | Medium | Add a minimal config consistent with `apps/web`'s, for parity across the monorepo. |
| No `.prettierrc*` found anywhere in the repo | Formatting isn't automated — relies entirely on manual consistency / editor defaults. | Low | Optional — add Prettier + a pre-commit hook if formatting drift becomes a real problem; not urgent today. |
| `pipeline/package.json:10` | `"scrape": "node dist/jobs/scraper.js"` — **no file named `scraper.ts`/`scraper.js` exists anywhere in `pipeline/src`.** The actual (also-unused) scheduler is `pipeline/src/jobs/scheduler.ts`. This script would fail immediately with a module-not-found error if run. | Medium | Fix the path (`dist/jobs/scheduler.js`) or remove the script — currently it's just broken. |
| `apps/web/package.json` vs `apps/api/package.json` | `@supabase/supabase-js` version drift: web pins `^2.101.1`, api pins `^2.39.0` — a significant gap for a library both workspaces depend on for correctness-critical auth/DB behavior. | Medium | Align both to the same version (or at minimum the same major/minor range) to avoid subtle client-behavior differences between frontend and backend. |
| `apps/api/package.json` | `express@^4.18.2` — current stable is meaningfully ahead (4.21.x, and a 5.x major exists). Not urgent, but worth a scheduled bump. | Low | Routine dependency maintenance, not blocking. |
| Icon libraries | Only `lucide-react` used app-wide — no duplicate icon sets found. | — | No action; noted as a clean result since the prompt asked. |

---

## Top 10 Priority Fixes

Ranked by impact vs. effort — highest-value, lowest-effort first.

1. **Delete `Portfolio.css`** (1077 lines, zero references) — pure deletion, zero risk, immediate cleanup win.
2. **Delete the other confirmed-dead files**: `AuthModal.tsx`, `DynamicAssessment.tsx`, `ExternalResourceCard.tsx`, `components/tutorial/*` (4 files), `apps/api/src/services/{pathEngine,scorer}.ts` — all confirmed unreachable via grep, all pure deletions.
3. **Fix `pipeline/package.json`'s broken `scrape` script** (`scraper.js` → `scheduler.js`, or remove it) — one-line fix for something that's currently just broken.
4. **Fix the ESLint failures** (28 errors, confirmed by running it) — either fix the 26 `any` types and 2 effect-setState issues, or determine why CI isn't actually catching this if the docs say it should be gating deploys.
5. **Add `aria-label` to the ~5 icon-only close buttons** across `ChallengeModal`, `DoubtSolverModal`, `AITutorPanel` — mechanical, low-effort, real accessibility win.
6. **Add Escape-to-close to the 5 modals missing it**, ideally by extracting the pattern `SignInModal`/`ProjectModal` already have into one shared hook — fixes both the a11y gap and a §2 duplicate-logic finding at once.
7. **Remove unused dependencies** (`axios`, and either wire up or remove `@tanstack/react-query`) — shrinks the install and clarifies intent.
8. **Fix the `IncubatorPage.tsx` delete handler** to check `error` before removing the card from local state — small fix, real correctness/trust issue (user can be told something succeeded when it didn't).
9. **Compress `favicon.jpg`** (314KB → should be a few KB) — trivial, measurable bundle-size win.
10. **Resolve the `@supabase/supabase-js` version drift** between `apps/web` (2.101.1) and `apps/api` (2.39.0) — align both before it causes a real behavioral bug that's hard to trace back to a version mismatch.

**Not in the top 10, but worth a deliberate decision rather than a quick fix:** the 8-file direct-frontend-to-Supabase pattern (§2/§4) and the zero test coverage across the whole repo — both are real, both are larger architectural conversations than a single sitting can resolve.
