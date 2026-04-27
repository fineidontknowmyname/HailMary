# Project Hail Mary: Cross-File Connection Map

This map traces how data and logic flow across the stack during specific user interactions.

### 1. App First Loads (The Boot Sequence)
1.  **`App.tsx`**: The `useEffect` hook fires immediately on mount.
2.  **`authStore.ts`**: Calls `initialize()`. It checks `supabase.auth.getSession()` for an existing browser cookie.
3.  **`useBoundStore.ts`**: Calls `fetchIntel()`.
4.  **`intelSlice.ts`**: `fetchIntel()` sends a `GET` request to the API.
5.  **`api/index.ts`**: Receives the request and routes it to `intel.routes.ts`.
6.  **`api/IntelController.ts`**: Calls `IntelService.getCuratedIntel()`, transforms the data, and sends it back to the client.
7.  **`App.tsx`**: The store updates, `isLoading` becomes `false`, and the `<IntelCard>` grid renders.

### 2. User Signs Up
1.  **`AuthModal.tsx`**: User fills the form and clicks "Create account".
2.  **`authStore.ts`**: `signUp()` is triggered, calling `supabase.auth.signUp()`.
3.  **Supabase Auth**: A new user record is created in the Supabase Auth database.
4.  **`authStore.ts`**: `onAuthStateChange` listener in `initialize` detects the new session.
5.  **`useAuth.ts`**: The `isLoggedIn` boolean flips to `true`.
6.  **`App.tsx`**: The UI updates to show "Welcome back" and the "Mission Control" button.

### 3. User Searches for a Resource
1.  **`App.tsx`**: User types into the search `<input>`.
2.  **`FilterBar.tsx`**: The `setSearchQuery` prop is called, updating the query in `App.tsx`.
3.  **`useResources.ts`**: (If used via search component) The `filters` object changes, triggering the `fuse.search()` logic.
4.  **Fuse.js**: Scans the pre-loaded `resources` array for the best fuzzy matches across titles and tags.
5.  **`App.tsx`**: The `filteredIntel` memoized variable recalculates the result list.
6.  **React**: Re-renders the grid with only the matching cards.

### 4. User Marks a Resource Done
1.  **`IntelCard.tsx`**: User clicks "Mark Complete".
2.  **`useProgress.ts`**: `toggleComplete(id)` is called.
3.  **Optimistic UI**: The ID is immediately added to the `completed` **Set**. The card turns green instantly.
4.  **`useProgress.ts`**: Sends a `POST` to `/api/progress`.
5.  **`api/progress.routes.ts`**: Validates the JWT token via `auth.ts` middleware.
6.  **`api/ProgressController.ts`**: Calls `.upsert()` on the `user_progress` table in Supabase.
7.  **`useProgress.ts`**: If the server fails, the `catch` block removes the ID from the Set to revert the UI.

### 5. User Opens Profile
1.  **`App.tsx`**: User clicks "Mission Control". `setShowProfile(true)` is called.
2.  **`ProfilePage.tsx`**: Component mounts. `useEffect` detects the `user` and calls `fetchProfile()`.
3.  **`lib/profile.ts`**: `fetchProfile` queries Supabase `user_profiles` for the specific `user_id`.
4.  **`ProfilePage.tsx`**: State is populated. User edits their Bio and clicks "Save".
5.  **`ProfilePage.tsx`**: Calls `saveSection()`, which triggers `upsertProfile()`.
6.  **`lib/profile.ts`**: Sends the updated data to the DB. A "✓ Saved" message appears via local state.

### 6. User Refreshes while Logged In
1.  **Browser**: Reloads the page, wiping the in-memory Zustand state.
2.  **`App.tsx`**: Re-runs `initialize()`.
3.  **`authStore.ts`**: `supabase.auth.getSession()` retrieves the valid JWT from the browser's local storage.
4.  **`authStore.ts`**: `set({ user, session })` is called.
5.  **React**: The app detects the user is present and stays on the dashboard rather than showing the login screen.

---

# Technical Glossary

*   **API (Application Programming Interface)**: A set of rules that allows the frontend (React) and backend (Express) to talk to each other.
*   **Async/Await**: JavaScript keywords used to handle tasks that take time (like fetching data) without freezing the UI.
*   **Auth (Authentication)**: The process of verifying who a user is (Login/Signup).
*   **Backdrop Blur**: A CSS effect that blurs the content behind an element (common in glassmorphism).
*   **Controller**: A backend file that contains the "logic" for a specific route (e.g., how to save a profile).
*   **CORS (Cross-Origin Resource Sharing)**: A security feature that controls which websites are allowed to access your API.
*   **Custom Hook**: A reusable React function (starting with `use`) that holds logic like fetching data or tracking progress.
*   **Dependency Array**: The list of variables inside `useEffect` or `useMemo` that tells React when to re-run the code.
*   **Destructuring**: A JavaScript syntax that "unpacks" values from arrays or properties from objects into distinct variables.
*   **Endpoint**: A specific URL on the API (like `/api/intel`) that provides a specific service.
*   **Environment Variables (`.env`)**: A file used to store secret keys (like Supabase URLs) so they aren't hardcoded in the app.
*   **Express**: The framework used to build the web server and handle HTTP requests.
*   **Fuzzy Search**: A search method that finds results even if the user makes a typo or provides only a partial word.
*   **Hook**: A special function that lets you "hook into" React features like state and lifecycle.
*   **HTTP Verbs**: Standard commands like `GET` (fetch), `POST` (create), `PUT` (update), and `DELETE` (remove).
*   **Interface**: A TypeScript tool that defines the "shape" of an object (what fields it must have).
*   **JWT (JSON Web Token)**: A secure, encoded string used to prove a user is logged in for every API request.
*   **Middleware**: Code that runs "in the middle" of a request, often used for security checks (Auth).
*   **Model**: A mental representation of how a complex system works; also refers to data structures in a database.
*   **Monorepo**: A project structure where multiple applications (API, Web, Pipeline) live in the same repository.
*   **Nullish Coalescing (`??`)**: A logic operator that provides a backup value if a variable is `null` or `undefined`.
*   **Optimistic Update**: Updating the UI before the server responds to make the app feel faster.
*   **Optional Chaining (`?.`)**: Safely accessing a property of an object that might be `null` without crashing the app.
*   **Partial<T>**: A TypeScript utility that makes all fields in a type optional.
*   **Props**: Data passed from a Parent component down to a Child component.
*   **React**: The frontend library used to build the User Interface.
*   **REST**: An architectural style for providing standards between computer systems on the web.
*   **Route**: A path on the web server (like `/api/progress`) that corresponds to a specific action.
*   **Selector**: A function used to grab a specific piece of data from a global store (like the User from the Auth store).
*   **Set**: A JavaScript collection of unique values (no duplicates allowed).
*   **State**: Data that changes over time and triggers the UI to re-render when it does.
*   **Supabase**: The "Backend-as-a-Service" used for the database, authentication, and file storage.
*   **Tailwind CSS**: A utility-first CSS framework used for fast, modern styling.
*   **TypeScript**: A version of JavaScript with "Types" added to catch bugs early in development.
*   **UPSERT**: Short for "Update or Insert"; it saves data regardless of whether a record already exists.
*   **Z-Index**: A CSS property that determines which elements sit "on top" of others.
*   **ZPD (Zone of Proximal Development)**: The educational philosophy used here to suggest content that is "just right" for the user's level.
*   **Zustand**: The lightweight library used for managing "Global State" (state shared between all components).
