# Debugging Playbook

A practical guide to locating and fixing bugs in this codebase, given its split architecture (some pages hit Express, some hit Supabase directly).

## Step 0: Figure out which layer it's in

Always do this first. Before touching any code, open the browser **Network tab** and find the failing request. Its URL tells you which codebase to even open:

- **`localhost:4000/api/...`** → it's an Express bug. Go to Step 1.
- **`*.supabase.co/rest/v1/...`** → it's a direct Supabase call from `IncubatorPage`, `ProjectModal`, `ResumeControlPanel`, `ResumeBuilder`, `PortfolioPage`, `PublicProfileView`, `ContributeResource`, or `DynamicAssessment`. Your backend logs will show nothing — go straight to Step 3.
- **No network request at all** → it's a pure frontend logic/render bug (state, a bad prop, a thrown error during render). Go to Step 2.

This single check saves you from grepping the wrong half of the repo.

## Step 1: Backend — read the error, don't guess it

You already have infrastructure for this. Use it before adding a single `console.log`:

- Every controller is wrapped in `catchAsync` (`errorHandler.ts`), so any thrown error lands in `globalErrorHandler`, which in dev mode returns the full stack trace in the JSON response body. Open the Network tab → the failing request → Response — the answer is usually right there, no server access needed.
- If the failure happens before your controller even logs anything, it's almost always in middleware — check `requireAuth` first (bad/missing token), then the route match itself (typo'd path, wrong HTTP verb).
- For precise, non-print debugging: run the API with `tsx watch --inspect src/index.ts` and attach VS Code's debugger (or `chrome://inspect`). Set a real breakpoint inside the controller — you get to inspect `req.body`, `(req as any).user`, and the live Supabase `{data, error}` object instead of guessing what to print.
- If you do want a print, put it in exactly one place for maximum signal — a request logger right after `express.json()` in `index.ts`:

  ```ts
  app.use((req, _res, next) => {
    console.log(req.method, req.path, req.headers.authorization ? 'auth' : 'no-auth');
    next();
  });
  ```

  That one line tells you immediately whether a request even reached your server, with the right method/path/auth-presence — usually enough to know if the bug is client-side (never sent) or server-side (sent, mishandled).

## Step 2: Frontend — narrow before you print

- **React DevTools → Components tab**: inspect a component's actual live props/state instead of guessing. This is the fastest way to catch the type-drift bug class we found (e.g., open `ResumeBuilder` in the tree and look at `profile` — you'll see immediately whether `full_name`/`email`/`phone` are really `undefined`, confirming or ruling out that theory in seconds).
- **`console.table(...)` instead of `console.log(...)`** for arrays of objects. E.g. in `useAssessmentStore.submitAssessment`, `console.table(gradedAnswers)` renders question/selected/correct as columns — an index-misalignment bug (the grading-by-position issue we flagged) jumps out visually in a way nested `console.log` output never will.
- **Zustand devtools**: `useAssessmentStore` already has `devtools()` wired in (`useAssessmentStore.ts:81`). Install the Redux DevTools browser extension, open it, pick "AssessmentStore" — you get every action and state diff on a timeline for free. `useBoundStore` and `useAuthStore` don't have this wrapper; adding `devtools()` to those two takes one import and one wrap, and gets you the same free timeline for auth/profile bugs.
- **`debugger;` + Sources panel** beats a chain of `console.log`s when you need to step through branching logic — e.g. `handleEndSession`'s `data.needsAITutor` / `data.isMilestone` branches. Drop `debugger;` right before the branch, reload, and step through with real closure inspection instead of guessing what to print at each branch.
- **There's no Error Boundary anywhere in the app.** Right now, if any component throws during render, React unmounts silently to a blank white screen — you only see the trace in the console, with no indication in the UI of what broke. Wrapping `<AppRouter />` in an error boundary is a small, permanent upgrade: it'd show you which page crashed instead of a blank screen.

## Step 3: Supabase-direct calls — the special case

The Supabase JS client **never throws** — every call resolves to `{ data, error }`, even on failure. That means the moment code destructures without checking `error`, a failure becomes permanently invisible.

There's a live example at `IncubatorPage.tsx:59`:

```ts
await supabase.from('hailmary_projects').delete().eq('id', project.id);
```

No `error` is captured at all. If this fails (RLS denial, network blip), the UI just proceeds as if it succeeded.

To debug anything in this family:

1. Grep the component for `await supabase` and check whether `error` is destructured **and** actually branched on (`if (error) ...`), not just named and ignored.
2. If it's genuinely silent, temporarily add the check yourself: `if (error) console.error(error.code, error.message, error.details)`. Supabase error objects carry a `code` (e.g. `42501` = RLS violation, `23505` = unique constraint) that tells you precisely what failed.
3. Cross-check against the Supabase dashboard → Logs → API logs for the project — every REST call (including ones the frontend swallowed) shows up there with status and error detail, independent of your browser console.

## Once you've found it: fix at the boundary, not with a patch

- Fix where the mismatch actually originates (the type, the missing check, the wrong destructure) — not by adding a fallback (`|| ''`, `?? []`) one level up that just hides the symptom. Fallback chains are exactly how the `ResumeBuilder` field-drift issue stayed invisible this long.
- After fixing, re-trigger the same request in the Network tab (right-click → Replay, or just redo the action) to confirm the fix against the real response, not just "it looks right in the editor."
- There's currently no test framework in this repo (`apps/web/package.json` has none configured) — so nothing stops a fixed bug from silently coming back. Setting up a minimal Vitest config would let a fix like the assessment-grading index bug be pinned down with a real regression test instead of re-checking by hand each time.
