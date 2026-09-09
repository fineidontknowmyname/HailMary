# Comments Log

Explanatory notes for code that is intentionally kept comment-free.
Each entry is what would otherwise have been an inline comment.

---

## 2026-09-10 — Sign Out on the Profile page

### apps/web/src/pages/ProfilePage.tsx

- `signOut` is pulled from the existing `useAuth()` call; `useNavigate` is added
  (same router-hook pattern as `components/UpdatePasswordModal.tsx`). ProfilePage
  always renders inside the Router — via the `/profile` route and via the
  `App.tsx` `showProfile` render path.
- `handleSignOut` awaits `signOut()` then `navigate('/', { replace: true })`.
  Without the redirect the user would land on ProfilePage's own `if (!user)`
  "sign in to view profile" empty state right after signing out.
- The button sits in the sticky header row (with `← Back` and the logo), pushed
  right with `ml-auto`. Restrained styling — bordered pill, `theme.cardBorder` /
  `theme.muted`, hover to `theme.heading` via inline mouse handlers (the file has
  no hover classes / CSS module, and other buttons here use the same inline
  approach). Not an accent-coloured button.
- This is currently the only reachable logout control; `navigation/TopNav.tsx`
  has one too but that component is never mounted (`AppLayout` renders its own
  inline header).

---

## 2026-09-07 — Auth gate + header cleanup + assessment jumbling

### apps/web/src/AppRouter.tsx — `RequireAuth`

- New wrapper component placed around the `/mock-tests/*` and `/aptitude` route
  elements.
- When `useAuth().isLoggedIn` is false it renders a lock panel and, via a
  `useEffect`, dispatches the global `open-auth-modal` window event so the
  shared `SignInModal` in `AppLayout` auto-opens ("redirect" to login/sign-up).
- The button in the panel re-dispatches the same event so the user can
  reopen the modal if they dismiss it.
- When logged in it renders `children` unchanged.
- `title` prop is only the heading shown on the gate panel
  ("Mock Tests" / "Competitive Aptitude").

### apps/web/src/navigation/AppLayout.tsx — header (top-right)

- Removed the hard-coded `49 of 49 intel` span — it was a static string, never
  bound to any real count.
- Removed the `Mission Control` button (the logged-in branch). It dispatched an
  `open-profile` event that had no listener anywhere, so it was already inert.
  Profile is still reachable from the sidebar (`/profile`).
- Kept the light/dark theme toggle and the `Sign In` button (logged-out only);
  the former ternary is now a single `!session?.user` guard.

### apps/web/src/navigation/Sidebar.tsx — footer

- Removed the `Mission Control` label from the footer identity chip.
  The `U` avatar and `v1.0 · Beta` line are unchanged.

### apps/web/src/store/useAssessmentStore.ts — question/option jumbling

- `shuffle<T>()` — Fisher–Yates, returns a new array, does not mutate input.
- `startAssessment` now:
  - shuffles the source question array on every attempt (new order each time
    the test is opened / "Take Another Assessment" is pressed — the store is
    not persisted, so each start re-randomises);
  - shuffles the A/B/C/D options within each question. `order` is the list of
    original option indices after shuffling; `correctAnswerIndex` is where the
    original `raw.answer` landed in that new order.
- New state field `answerKey: AnswerKeyEntry[]` holds `{ correctAnswerIndex,
  explanation }` in the same order as `questions`. It replaces the old grading
  path, which matched `mockQuestions[i]` / `codevitaQuestions[i]` by array
  index — that breaks once the order is shuffled.
- `submitAssessment` grades against `answerKey[i]` instead of the imported
  raw arrays. `questions[i].options` already holds the shuffled option text,
  so the result/review screen shows options in the order the user saw them.
- `answerKey` is included in `initialState`, so `resetAssessment` clears it.
