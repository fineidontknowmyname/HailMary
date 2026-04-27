# Project Hail Mary Learning Documentation

### FILE: apps/web/src/pages/ProfilePage.tsx
**Purpose in one sentence:** Provides an interactive UI for authenticated users to view and update their profile data using categorized sections.
**Official docs for the main library used:** [React Docs](https://react.dev/)

#### Code Walkthrough

**`useState` (destructuring)**
- **What it is:** A React Hook that lets you add state variables to your component. The `[state, setState]` syntax is array destructuring.
- **Why it exists:** To persist values between renders and trigger a UI refresh when those values change.
- **How it's used here:** Managing profile form inputs, saving status, and initial data loading flags.
- **Official docs:** [useState](https://react.dev/reference/react/useState)
- **Mental model:** A component's personal memory that, when updated, forces the page to redraw to show the newly remembered data.
- **Example from this codebase:**
`const [loading, setLoading] = useState(true)`

**`useEffect` (dependency arrays)**
- **What it is:** A React Hook that lets you synchronize a component with an external system after rendering.
- **Why it exists:** Network requests or DOM mutations shouldn't block the screen from painting.
- **How it's used here:** Fetches the profile data only after the component mounts and the `user` object becomes available. The `[user]` array ensures it only re-runs if the user object changes.
- **Official docs:** [useEffect](https://react.dev/reference/react/useEffect)
- **Mental model:** A "do this side task once the UI is painted" hook, where the dependency array limits *when* it fires again.
- **Example from this codebase:**
```tsx
  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(p => { ... })
  }, [user])
```

**`Partial<T>` (TypeScript)**
- **What it is:** A utility type that sets all properties of type `T` to optional.
- **Why it exists:** Allows you to build or update an object piece by piece without TypeScript yelling that you're missing required properties.
- **How it's used here:** Initializing the profile state before all user data is fully fetched or provided.
- **Official docs:** [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)
- **Mental model:** Turning a strict checklist into a "fill in whatever boxes you want" form.
- **Example from this codebase:**
`const [profile, setProfile] = useState<Partial<UserProfile>>({})`

**`Record<K, V>` (TypeScript)**
- **What it is:** Constructs an object type whose property keys are of type `K` and whose property values are of type `V`.
- **Why it exists:** Provides a quick way to strongly type an object acting as a dictionary or map.
- **How it's used here:** Tracing which specific UI sections (like 'basic', 'social') are currently saving or have been saved.
- **Official docs:** [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)
- **Mental model:** A strict dictionary locking down exactly what the keys and values are allowed to be.
- **Example from this codebase:**
`const [saving, setSaving] = useState<Record<string, boolean>>({})`

**`?.` (Optional Chaining)**
- **What it is:** Allows reading a property from an object without causing an error if the object itself is null or undefined.
- **Why it exists:** Replaces long checks like `if (user && user.email)` with a cleaner syntax.
- **How it's used here:** Reaching into the `user` object to grab their email, gracefully returning `undefined` (which React safely ignores) if the user isn't logged in yet.
- **Official docs:** [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- **Mental model:** Asking "Hey, if you exist, can I see your ID?" instead of demanding it and causing a crash.
- **Example from this codebase:**
`<p className="text-[#7a849a] text-sm mt-1">{user?.email}</p>`

**`??` (Nullish Coalescing)**
- **What it is:** A logical operator that returns its right-hand operand when its left-hand operand is null or undefined.
- **Why it exists:** A safer fallback than `||`, because `||` also overrides "falsy" values like `0` or `""` which might be valid user inputs.
- **How it's used here:** Defaulting input values to an empty string `''` if the backend hasn't provided a value, preventing React "uncontrolled input" warnings.
- **Official docs:** [Nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- **Mental model:** "Use my value, but if I literally have nothing (null/undefined), use this backup."
- **Example from this codebase:**
`value={profile.username ?? ''}`

**`setTimeout` (JavaScript API)**
- **What it is:** A native web API that executes a block of code after a specified delay in milliseconds.
- **Why it exists:** For scheduling asynchronous delays without freezing the browser.
- **How it's used here:** Hiding the visual "✓ Saved" button text after 2.5 seconds by resetting its state back to false.
- **Official docs:** [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- **Mental model:** A kitchen timer that runs a function when the bell rings.
- **Example from this codebase:**
`setTimeout(() => setSaved(s => ({ ...s, [section]: false })), 2500)`

**`backdrop-blur-md` (Tailwind)**
- **What it is:** A Tailwind utility class applying a CSS `backdrop-filter: blur()`.
- **Why it exists:** Creates modern "glassmorphism" layouts.
- **How it's used here:** Adding a frosted-glass effect to the top sticky navigation bar so scrolling content is visible but blurry underneath.
- **Official docs:** [Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur)
- **Mental model:** Looking through frosted bathroom glass.
- **Example from this codebase:**
`className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md border-b border-[#1e2535]"`

**`key` props (React)**
- **What it is:** A special string attribute you need to include when generating components dynamically from an array.
- **Why it exists:** React uses keys to identify which items have changed, been added, or been removed, ensuring efficient UI updates.
- **How it's used here:** Rendering the learning goal hour buttons in a `.map()` loop.
- **Official docs:** [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- **Mental model:** Nametags for mapped elements so React doesn't get confused if the list shuffles.
- **Example from this codebase:**
```tsx
{[1, 2, 3, 5, 7, 10].map(h => (
  <button key={h} ...>
```

**⚠️ Common Mistakes:**
1. **Mutating State Directly:** A beginner might try `profile.username = "Alice"` instead of using the setter function, which will fail to trigger a re-render.
2. **Missing `await` on API Calls:** Forgetting `await upsertProfile(...)` will cause the "Saving" indicator to disappear instantly before the server has actually secured the data.
3. **Unstable `useEffect` Loops:** Omitting the dependency array `[user]` entirely would cause the data fetch logic to run infinitely on every single render.

---

### FILE: apps/web/src/store/intelSlice.ts
**Purpose in one sentence:** Defines a Zustand module (slice) for fetching, holding, and managing the state of learning materials ("Intel").
**Official docs for the main library used:** [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)

#### Code Walkthrough

**`interface` vs `type` (TypeScript)**
- **What it is:** Two ways to define object shapes in TypeScript. Interfaces are specifically for defining shapes of objects and classes.
- **Why it exists:** Provides structure to your data payloads ensuring the compiler catches missing or incorrect properties.
- **How it's used here:** Typing out exactly what data arrays and functions belong inside the `IntelSlice`.
- **Official docs:** [Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)
- **Mental model:** An architectural blueprint dictating exact room dimensions for a house.
- **Example from this codebase:**
```tsx
export interface IntelSlice {
  intel: Intel[];
  isLoading: boolean;
  //...
}
```

**`create<T>()` / `StateCreator<T>` (Zustand)**
- **What it is:** A TypeScript generic type from Zustand specifically for typing slice creators.
- **Why it exists:** Large global stores are hard to manage; slices let us split logic into distinct files. `StateCreator` ensures the slice adheres exactly to the `IntelSlice` types.
- **How it's used here:** Enforcing that `createIntelSlice` actually yields an `intel` array, an `isLoading` boolean, etc.
- **Official docs:** [Zustand Typescript](https://docs.pmnd.rs/zustand/guides/typescript)
- **Mental model:** A mold that makes sure the slice of pie perfectly fits into the larger pan.
- **Example from this codebase:**
`export const createIntelSlice: StateCreator<IntelSlice> = (set) => ({ ... })`

**`set` function (Zustand)**
- **What it is:** A Zustand mutator function passed into the state creator.
- **Why it exists:** It efficiently merges your state updates with the existing store data and alerts any listening React components.
- **How it's used here:** Toggling loading indicators and filling the store with the newly fetched `data`.
- **Official docs:** [Zustand Updating State](https://docs.pmnd.rs/zustand/guides/updating-state)
- **Mental model:** Returning a book to the library shelf (merging new info automatically without replacing the whole shelf).
- **Example from this codebase:**
`set({ intel: data, isLoading: false });`

**`async/await` vs `.then()`**
- **What it is:** Syntactic sugar built on top of Javascript Promises.
- **Why it exists:** Makes asynchronous network code read sequentially, like synchronous logic, avoiding "callback hell" or deep `.then()` chaining.
- **How it's used here:** Instructing the `fetchIntel` function to pause execution, wait for the Express API to reply, then proceed with the result.
- **Official docs:** [Async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- **Mental model:** Waiting physically at the mailbox for a letter (`await`) rather than leaving a sticky note to be reminded later (`.then()`).
- **Example from this codebase:**
`const data = await api.get<Intel[]>('/api/intel');`

**⚠️ Common Mistakes:**
1. **Silent Catches:** A beginner might catch errors in the `catch` block but forget to update the `error` state via the `set()` call, causing the app to fail silently without showing a UI warning.
2. **Forgetting to toggle loading status:** If an API call fails but the `try/catch` block doesn't set `isLoading: false` in the `catch`, the UI might get stuck showing an infinite spinner.

---

### FILE: apps/web/src/components/IntelCard.tsx
**Purpose in one sentence:** Visually renders a single learning resource as an interactive card layout, including its thumbnail, metadata, and progress tracking buttons.
**Official docs for the main library used:** [React Docs](https://react.dev/)

#### Code Walkthrough

**Props vs State (React)**
- **What it is:** Props are inputs passed down *from* a parent, whereas State is data managed *inside* the component itself.
- **Why it exists:** Ensures data flow is predictable (one-way data binding) from parent to child.
- **How it's used here:** The card relies almost entirely on `props` (`intel`, `isLoggedIn`, etc.) handed to it, making it highly reusable. The only `state` it holds internally is the lightweight `imgError` flag.
- **Official docs:** [Passing Props](https://react.dev/learn/passing-props-to-a-component)
- **Mental model:** Props are the instructions given to a worker by their boss; State is what the worker personally remembers while doing the job.
- **Example from this codebase:**
`export function IntelCard({ intel, isLoggedIn... }: IntelCardProps)`

**Conditional Rendering (React)**
- **What it is:** Delivering different JSX outputs depending on standard Javascript boolean logic (e.g., `&&`, ternary `? :`).
- **Why it exists:** User interfaces dynamically change depending on data (e.g., if a video doesn't have a thumbnail, render an icon layout instead).
- **How it's used here:** To check if an image URL exists or if a user `isLoggedIn` before injecting the extra action buttons at the bottom.
- **Official docs:** [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- **Mental model:** A crossroads sign: "If authenticated, take the left path to see buttons; if not, take the right path where buttons are hidden."
- **Example from this codebase:**
`{isLoggedIn && ( ... )}`

**`aspect-video` (Tailwind)**
- **What it is:** Sets an element's aspect ratio strictly to `16:9`.
- **Why it exists:** Keeps media thumbnails consistently shaped without relying on hardcoded fixed heights across different phone vs. desktop sizes.
- **How it's used here:** Wrapping the image container so the card headers look uniform and cinematic.
- **Official docs:** [Aspect Ratio](https://tailwindcss.com/docs/aspect-ratio)
- **Mental model:** An unbreakable, perfectly scaled picture frame sized for movie screens.
- **Example from this codebase:**
`className="relative aspect-video w-full overflow-hidden bg-black block"`

**`line-clamp-2` (Tailwind)**
- **What it is:** Truncates excessive text after two lines, automatically appending an ellipsis (`...`).
- **Why it exists:** Prevents huge chunks of description text from pushing content down and breaking the uniform card alignments in the grid.
- **How it's used here:** Applied to the intel titles and descriptions to strictly enforce grid aesthetics.
- **Official docs:** [Line Clamp](https://tailwindcss.com/docs/line-clamp)
- **Mental model:** A paper shredder that cuts off any document strictly after two lines.
- **Example from this codebase:**
`<p className="text-sm text-gray-400 line-clamp-2 mb-4">`

**Event Types: `e.preventDefault()`**
- **What it is:** A React SyntheticEvent method to stop the browser's default behavior for an event trigger.
- **Why it exists:** Very useful if a button sits inside an `<a>` tag, and you want the button click to trigger your custom logic *without* the browser activating the wrapper link.
- **How it's used here:** Preventing checking off a mission inside a card from also suddenly navigating the user to the article URL in a new tab.
- **Official docs:** [Responding to Events](https://react.dev/learn/responding-to-events#preventing-default-behavior)
- **Mental model:** Intercepting a letter: "I got this click command. Deal with it locally, do not pass it upstream to the big boss!"
- **Example from this codebase:**
`onClick={(e) => { e.preventDefault(); ... }}`

**⚠️ Common Mistakes:**
1. **Assuming all Intel items have videos:** Forgetting to handle the fallback UI when `thumbnailUrl` is null leads to broken image icons completely breaking immersion.
2. **Event Bubbling Nightmares:** Beginners routinely don't apply `e.preventDefault()` inside cards that behave as clickable links container elements, causing frustrating double-actions when users intend to just click inner controls.

---

### FILE: apps/web/src/App.tsx
**Purpose in one sentence:** The root entry component that acts as the primary layout, sets up the application's global network routing, user authentication, and main search/feed logic.
**Official docs for the main library used:** [React Docs](https://react.dev/)

#### Code Walkthrough

**`useMemo` (React)**
- **What it is:** A React Hook that caches the result of an expensive calculation between re-renders.
- **Why it exists:** Prevents heavy or complex logic (like sorting or filtering large arrays) from running redundantly on every keystroke or tiny unrelated UI update.
- **How it's used here:** Caching the list of `filteredIntel` based on search queries and dropdown filters so it doesn't unnecessarily map through hundreds of items repeatedly unless those specific filter dependencies alter.
- **Official docs:** [useMemo](https://react.dev/reference/react/useMemo)
- **Mental model:** Doing a complex math problem once, writing the answer on a sticky note, and just reading the note until the base numbers drastically change.
- **Example from this codebase:**
```tsx
const filteredIntel = useMemo(() => { 
  return intel.filter(...) 
}, [intel, searchQuery, selectedType, selectedDepth])
```

**Zustand Selectors**
- **What it is:** Extracting only specific piece(s) of state from a global Zustand store rather than entire objects.
- **Why it exists:** If you grab the whole global store, your component will re-render if *anything* in the entire application store changes. Using a selector ensures optimal performance by only re-rendering when the *specifically selected* data changes.
- **How it's used here:** Specifically isolating the `initialize` trigger and `initialized` states off the global `useAuthStore` without caring about anything else going on with Auth.
- **Official docs:** [Zustand Selectors](https://docs.pmnd.rs/zustand/guides/auto-generating-selectors)
- **Mental model:** Subscribing only to the sports page segment of the newspaper instead of ordering front-page delivery for the entire massive paper daily.
- **Example from this codebase:**
`const initialize = useAuthStore(s => s.initialize);`

**`Set` Data Structure (`completed.size`)**
- **What it is:** A native JavaScript structure designed to exclusively hold unique values.
- **Why it exists:** Standard Arrays allow duplicates. A `Set` guarantees mathematically that a user cannot accidentally complete a mission twice and artificially inflate their true count metric. `.size` provides the exact current count.
- **How it's used here:** Deriving how many distinct missions a user has beaten to render on their dashboard (`completed.size`).
- **Official docs:** [MDN - Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- **Mental model:** A specialized bucket that automatically burns identical tickets tossed inside, rendering an exact count of unique stubs.
- **Example from this codebase:**
`{completed.size > 0 && (...)}`

**Union Types (`string | null`)**
- **What it is:** A TypeScript architecture feature explicitly allowing a value to pivot between several distinct strict types.
- **Why it exists:** Real-world state often isn't black or white. A selected category UI filter might be a strict text string ("video") or nonexistent/empty ("null").
- **How it's used here:** Declaring that the exact `selectedType` state can legally hold nothing (`null`) allowing all lists to pass unfiltered without TS compilation failures.
- **Official docs:** [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- **Mental model:** A physical doorway slot that strictly accepts either "a standard key shape" or "absolutely nothing block it".
- **Example from this codebase:**
`const [selectedType, setSelectedType] = useState<string | null>(null);`

**`animate-pulse` (Tailwind)**
- **What it is:** A Tailwind utility that creates a gentle fading CSS keyframe looping opacity animation.
- **Why it exists:** Superbly useful for rendering skeleton UI loaders, providing clear visual feedback that the application hasn't frozen but is actively "thinking".
- **How it's used here:** Animating the main "Project Hail Mary" font logo splash screen while waiting for the async `useEffect` check against the browser's credentials to complete.
- **Official docs:** [Tailwind Animation Pulse](https://tailwindcss.com/docs/animation#pulse)
- **Mental model:** A slow, softly breathing digital terminal glow effect.
- **Example from this codebase:**
`<span className="w-1.5 h-1.5 rounded-full bg-[#4fffb0] animate-pulse" />`

**Stacking Context: `z-index` (Tailwind `z-40`)**
- **What it is:** A CSS layout property dictating the 3D visual stacking order of rendered elements.
- **Why it exists:** Absolutely vital to ensure that a fixed "sticky header", dropdown, or modal system doesn't accidentally fall visually behind later elements mapping onto the document flow.
- **How it's used here:** Guaranteeing the primary navigation header (`z-40`) anchors correctly above the heavily populated, scrollable intel artifact grids.
- **Official docs:** [Tailwind Z-Index](https://tailwindcss.com/docs/z-index)
- **Mental model:** Shuffling layers of paperwork files on a physical table; `z-40` places this specific paper forcibly near the top of the entire table stack.
- **Example from this codebase:**
`<nav className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md...">`

**⚠️ Common Mistakes:**
1. **Overusing `useMemo`:** Wrapping exceptionally simple strings or ultra-fast math inside `useMemo` actually hurts a React app's performance due to cache overhead; beginners often think they strictly need it across all variables.
2. **Missing Normalization inside array searches:** If `item.title.toLowerCase()` were removed during filtering, a basic UI search for exactly "react" would entirely fail to hit a legitimate tutorial formally titled "React Docs" securely due to rigid capitalization differences.
