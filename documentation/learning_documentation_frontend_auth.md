# Project Hail Mary Learning Documentation: Frontend Auth & Config

### FILE: apps/web/src/lib/supabase.ts
**Purpose in one sentence:** Initializes the official Supabase client for the frontend, connecting the web app to your backend database and auth services.
**Official docs for the main library used:** [Supabase Store](https://supabase.com/docs/reference/javascript/initializing)

#### Code Walkthrough

**`createClient()`**
- **What it is:** The primary function used to initialize a new Supabase client.
- **Why it exists:** It creates a "bridge" between your React app and Supabase. Without this, you can't query your database or log users in.
- **How it's used here:** It takes the URL and Anon Key from your environment variables and creates a single `supabase` instance used across the entire frontend.
- **Official docs:** [Initializing](https://supabase.com/docs/reference/javascript/initializing)
- **Mental model:** Dialing a phone number to establish a persistent line of communication with the Supabase server.
- **Example from this codebase:**
`export const supabase = createClient(supabaseUrl, supabaseAnonKey);`

**`import.meta.env` (Vite)**
- **What it is:** Vite's way of exposing environment variables to your code.
- **Why it exists:** It allows you to use sensitive or environment-specific values (like API keys) without hardcoding them into your source code.
- **How it's used here:** To pull `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your `.env` files.
- **Official docs:** [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- **Mental model:** A secure locker where you keep your keys, accessible only by typing a special code (`import.meta.env`).
- **Example from this codebase:**
`const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;`

**⚠️ Common Mistakes:**
1. **Missing `VITE_` Prefix:** Vite only exposes variables starting with `VITE_` to the client-side. If you name your variable `SUPABASE_URL`, it will be `undefined` in the browser.
2. **Commiting Secrets:** Never commit your actual `.env` file to GitHub. Only share the `.env.example` file.

---

### FILE: apps/web/src/lib/profile.ts
**Purpose in one sentence:** Provides reusable helper functions for fetching and updating a user's profile data in the database.
**Official docs for the main library used:** [Supabase Database](https://supabase.com/docs/reference/javascript/select)

#### Code Walkthrough

**`fetchProfile(userId: string)`**
- **What it is:** A custom asynchronous function that retrieves a specific user's row from the `user_profiles` table.
- **Why it exists:** To centralize data fetching logic so you don't have to rewrite complex Supabase queries in every UI component.
- **How it's used here:** It uses `.eq('user_id', userId).single()` to find the exact profile belonging to the logged-in user.
- **Official docs:** [Select](https://supabase.com/docs/reference/javascript/select)
- **Mental model:** A personal librarian who goes to the "profiles" shelf and brings back exactly one file based on an ID.
- **Example from this codebase:**
```typescript
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  // ...
}
```

**`upsertProfile(userId: string, updates: ProfileUpdate)`**
- **What it is:** A function that either inserts a new profile or updates an existing one for a user.
- **Why it exists:** It simplifies the logic of "save". You don't need to check "Does the profile exist?" first—Supabase handles it for you.
- **How it's used here:** It spreads the `updates` object and combines it with the `user_id` to either create or overwrite the profile row.
- **Official docs:** [Upsert](https://supabase.com/docs/reference/javascript/upsert)
- **Mental model:** Stamping a documents: If there's an old one, stamp over it. If not, stamp a new one.
- **Example from this codebase:**
```typescript
export async function upsertProfile(userId: string, updates: ProfileUpdate) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...updates })
  // ...
}
```

**⚠️ Common Mistakes:**
1. **Incorrect Table Name:** Typos like `user_profile` (singular) instead of `user_profiles` will return a "Table not found" error.
2. **Missing `user_id` in Upsert:** If you don't provide the `user_id`, Supabase won't know *which* profile to update, and it might try to create a new (invalid) entry.

---

### FILE: apps/web/src/auth/authStore.ts
**Purpose in one sentence:** A global Zustand store that manages the user's authentication state, including login, signup, and session persistence.
**Official docs for the main library used:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

#### Code Walkthrough

**`create<AuthState>()` (Zustand)**
- **What it is:** The Zustand function used to initialize a global state container.
- **Why it exists:** To keep track of "is the user logged in?" across all pages and components without passing props everywhere.
- **How it's used here:** It manages the `user` object, the current `session`, and a `loading` flag for auth operations.
- **Official docs:** [Zustand Getting Started](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Mental model:** A giant whiteboard in the middle of the room where everyone can see (and update) the current "Login Status".
- **Example from this codebase:**
`export const useAuthStore = create<AuthState>((set) => ({ ... }))`

**`supabase.auth.onAuthStateChange()`**
- **What it is:** A listener that triggers every time a user logs in, logs out, or their token refreshes.
- **Why it exists:** It ensures your React app stays perfectly synced with Supabase. If a user logs out in another tab, your app will know instantly.
- **How it's used here:** Inside the `initialize` function, it updates the Zustand store automatically whenever the user's status changes.
- **Official docs:** [onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- **Mental model:** A security guard at the gate who yells "The user just logged in!" every time it happens.
- **Example from this codebase:**
```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  set({ user: session?.user ?? null, session: session ?? null })
})
```

**`signInWithPassword()`**
- **What it is:** The Supabase method for logging in via email and password.
- **Why it exists:** To handle the complex cryptographic verification of credentials safely.
- **How it's used here:** It takes `email` and `password` from a form, sends them to Supabase, and if successful, updates the store with the new user session.
- **Official docs:** [signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- **Mental model:** Handing your keys to a validator who checks if they fit the lock and hands them back if they do.
- **Example from this codebase:**
`const { data, error } = await supabase.auth.signInWithPassword({ email, password })`

**⚠️ Common Mistakes:**
1. **Forgeting to initialize:** If `initialize()` is never called (usually in `App.tsx`), the user will appear logged out even if they have a valid session in their browser.
2. **Missing `isLoading` logic:** Forgetting to set `loading: true` during signup/signin leads to a poor user experience where the user clicks "Submit" and nothing appears to happen.

---

### FILE: apps/web/src/auth/useAuth.ts
**Purpose in one sentence:** A custom React Hook that provides components with easy, read-only access to auth state and actions.
**Official docs for the main library used:** [React Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

#### Code Walkthrough

**Selector Pattern (`s => s.user`)**
- **What it is:** A way to grab only a specific part of the Zustand store.
- **Why it exists:** Performance. If you only select `user`, your component won't re-render if the `isLoading` status changes elsewhere.
- **How it's used here:** It individually pulls the `user`, `session`, and various auth functions from the `useAuthStore`.
- **Official docs:** [Zustand Selectors](https://docs.pmnd.rs/zustand/guides/auto-generating-selectors)
- **Mental model:** A menu at a restaurant: instead of ordering "everything", you just ask for "the burger".
- **Example from this codebase:**
`const user = useAuthStore(s => s.user)`

**`!!user` (Double Bang)**
- **What it is:** A JavaScript trick to convert any value into a boolean (`true` or `false`).
- **Why it exists:** `user` might be an object (logged in) or `null` (logged out). `!!user` turns these into a simple `true` or `false`.
- **How it's used here:** To provide a convenient `isLoggedIn` boolean that components can use for conditional rendering.
- **Official docs:** [Symbolic Logic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT)
- **Mental model:** A simple YES/NO switch: "Do we have a user? Yes or No."
- **Example from this codebase:**
`isLoggedIn: !!user,`

**⚠️ Common Mistakes:**
1. **Direct Store Mutation:** Beginners might try to change store values directly inside this hook. Instead, always use the functions provided by the store (like `signIn`, `signOut`).
2. **Infinite Loops:** If you use `useAuth` inside a component that also updates the auth store without careful logic, you could trigger an infinite loop of re-renders. Always ensure state changes are triggered by user actions (like clicks).
