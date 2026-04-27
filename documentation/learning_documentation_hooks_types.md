# Project Hail Mary Learning Documentation: Hooks & Types

### FILE: apps/web/src/hooks/useResources.ts
**Purpose in one sentence:** Fetches learning materials based on category filters and provides advanced client-side fuzzy searching using Fuse.js.
**Official docs for the main library used:** [Fuse.js Docs](https://www.fusejs.io/)

#### Code Walkthrough

**`URLSearchParams`**
- **What it is:** A built-in JavaScript utility for easily constructing and managing the "query string" (the part of a URL after the `?`).
- **Why it exists:** Manual string concatenation for URLs (`?domain=` + domain + `&type=`...) is messy and prone to encoding errors. `URLSearchParams` handles the formatting and special characters automatically.
- **How it's used here:** Dynamically building the API request URL based on the user's active dropdown filters.
- **Official docs:** [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- **Mental model:** A physical form where you check boxes, which then automatically gets translated into a web address the server can understand.
- **Example from this codebase:**
```typescript
const params = new URLSearchParams()
if (filters.domain !== 'all') params.set('domain', filters.domain)
```

**`useMemo` (Fuse initialization)**
- **What it is:** A React Hook that "memoizes" (caches) an object so it isn't recreated on every single render.
- **Why it exists:** Initializing `new Fuse()` is a relatively expensive operation because it has to index all the resource text. We only want to re-index when the `resources` array actually changes.
- **How it's used here:** Ensuring the search engine instance is stable between simple UI renders unless a new network fetch updates the data.
- **Official docs:** [useMemo](https://react.dev/reference/react/useMemo)
- **Mental model:** Building a library index card system. You only redo the whole system if you get a shipment of new books, not every time someone walks into the library.
- **Example from this codebase:**
```typescript
const fuse = useMemo(() => new Fuse(resources, {
  keys: ['title', 'description', 'tags', ...],
  threshold: 0.35,
}), [resources])
```

**Fuzzy Search (`threshold`)**
- **What it is:** A search technique that finds matches even if the spelling is slightly off or if only a partial word is entered.
- **Why it exists:** Users make typos. Standard `.includes()` is strict; Fuzzy search is forgiving.
- **How it's used here:** Managing the search results. A `threshold` of `0.35` means it's quite strict (0.0 is exact match, 1.0 matches everything).
- **Official docs:** [Fuse.js Options](https://www.fusejs.io/api/options.html#threshold)
- **Mental model:** A "Did you mean...?" assistant that helps find "React" even if you typed "Reactt".
- **Example from this codebase:**
`threshold: 0.35,`

**⚠️ Common Mistakes:**
1. **Missing Dependency Arrays:** If you forget `[resources]` in the `fuse` useMemo, the search index will never update when new data arrives from the API.
2. **Double Filtering:** A beginner might try to filter by domain AND search using logic in two different places. Here, `resources` handled the network-level filtering, and `displayed` handles the client-side search.

---

### FILE: apps/web/src/hooks/useProgress.ts
**Purpose in one sentence:** Orchestrates the user's mission completion logic, managing both the local UI state (optimistic updates) and the server-side persistence.
**Official docs for the main library used:** [React useCallback](https://react.dev/reference/react/useCallback)

#### Code Walkthrough

**`useCallback`**
- **What it is:** A React Hook that caches a *function definition* between renders.
- **Why it exists:** In React, if you define a function inside a component, it’s a "new" function every time the component renders. Caching it with `useCallback` prevents unnecessary re-renders in child components that rely on that function as a prop.
- **How it's used here:** To ensure `fetchProgress` remains stable and doesn't trigger infinite `useEffect` loops when used as a dependency.
- **Official docs:** [useCallback](https://react.dev/reference/react/useCallback)
- **Mental model:** Memorizing a instruction manual once rather than writing it out from scratch every day.
- **Example from this codebase:**
`const fetchProgress = useCallback(async () => { ... }, [user]);`

**`Set<string>` (for Lookups)**
- **What it is:** A JavaScript collection that stores unique values.
- **Why it exists:** Checking if an item exists in an **Array** (`array.includes()`) is slow—it has to look at every item. Checking a **Set** (`set.has()`) is lightning fast (O(1) time complexity).
- **How it's used here:** Storing completed `intelId`s. This allows the UI to check "Is this mission done?" instantly for hundreds of cards.
- **Official docs:** [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- **Mental model:** A VIP list. The bouncer only has to check if your name is on the list, rather than walking through the whole club to see if you're inside.
- **Example from this codebase:**
`const [completed, setCompleted] = useState<Set<string>>(new Set());`

**Optimistic Updates**
- **What it is:** Updating the UI immediately assuming the server request will succeed, and rolling it back only if it fails.
- **Why it exists:** Network requests are slow. Optimistic updates make the app feel "instant" and "snappy" to the user.
- **How it's used here:** `setCompleted` is updated *before* the `await api.post` call. If the API fails, the `catch` block reverts the state.
- **Official docs:** [No direct React doc, see general UX patterns]
- **Mental model:** Checking a box on a physical checklist and assuming your boss will approve the change later. If they say no, you erase the checkmark.
- **Example from this codebase:**
```typescript
setCompleted(prev => { ... }); // Update UI first
try {
  await api.post(...); // Then wait for server
} catch (err) {
  setCompleted(prev => { ... }); // Revert if failed
}
```

**⚠️ Common Mistakes:**
1. **Mutation Pitfalls:** Using `prev.add(id)` directly would mutate the state object, which React won't detect. You must always create a **copy** (`new Set(prev)`) to trigger a re-render.
2. **Missing Reversal Logic:** If you update optimistically but forget the `catch` block, your UI will "lie" to the user about their progress if the internet cuts out.

---

### FILE: apps/web/src/types/index.ts
**Purpose in one sentence:** Defines the core "Resource" (Intel) object structure that moves through the entire application from database to UI.
**Official docs for the main library used:** [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)

#### Code Walkthrough

**`interface` (The Blueprint)**
- **What it is:** A way to name and describe an object's shape in TypeScript.
- **Why it exists:** It serves as a contract. If a component expects a `Resource`, TypeScript will scream if you forget to include a `title` or `link`.
- **How it's used here:** To define the 20+ fields that make up a learning resource card.
- **Official docs:** [Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)
- **Mental model:** A detailed ingredient list for a recipe. Every chef (component) knows exactly what's in the box.
- **Example from this codebase:**
```typescript
export interface Resource {
  id: string
  title: string
  // ...
}
```

**Union Types (Literal types)**
- **What it is:** Restricting a string property to only a specific set of allowed words.
- **Why it exists:** Prevents "magic strings". It ensures you can't accidentally mark a resource type as "viddo" instead of "video".
- **How it's used here:** Enforcing specific categories for `type`, `difficulty`, and `depth`.
- **Official docs:** [Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)
- **Mental model:** A dropdown menu that only has 4 options; you physically cannot pick a 5th.
- **Example from this codebase:**
`difficulty: 'beginner' | 'intermediate' | 'advanced'`

**⚠️ Common Mistakes:**
1. **Using `string` instead of Literals:** If you use `type: string`, you lose the ability for TypeScript to warn you about typos in your component logic.

---

### FILE: apps/web/src/types/profile.ts
**Purpose in one sentence:** Defines the structure of a user's profile and creates safe "helper types" for making updates.
**Official docs for the main library used:** [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

#### Code Walkthrough

**`Omit<T, K>`**
- **What it is:** A utility type that takes an existing type `T` and creates a new one by removing specific keys `K`.
- **Why it exists:** When updating a profile, we want to allow changing the bio, but we should **never** allow changing the `user_id` (which is the database anchor).
- **How it's used here:** Removing the `user_id` field from the "Update" version of the profile type.
- **Official docs:** [Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)
- **Mental model:** Photocopying a form but putting a strip of white-out over the "Social Security Number" field so it can't be changed.
- **Example from this codebase:**
`Omit<UserProfile, 'user_id'>`

**`Partial<T>`**
- **What it is:** A utility type that makes all properties of an object optional.
- **Why it exists:** When a user updates their profile, they might only change their "bio" while leaving their "username" alone. `Partial` allows us to send only the changed fields to the API.
- **How it's used here:** Wrapping the omitted profile fields so the frontend can send any combination of profile data.
- **Official docs:** [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)
- **Mental model:** An optional survey where you can answer only the questions you want and skip the rest.
- **Example from this codebase:**
`export type ProfileUpdate = Partial<Omit<UserProfile, 'user_id'>>`

**⚠️ Common Mistakes:**
1. **Forgetting `Omit` in Updates:** If your update type includes `user_id`, a developer might accidentally try to save a new ID, which would likely cause a database constraint error or a security vulnerability.
2. **Ignoring `null` vs `undefined`:** In this file, many fields are `string | null`. This is important because it tells TypeScript that "nothing" is a valid value coming from the database. No profile field should just be a string without a null check.
`username: string | null`
