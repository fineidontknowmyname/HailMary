# Project Hail Mary Learning Documentation: Main Pages

### FILE: apps/web/src/pages/ProfilePage.tsx
**Purpose in one sentence:** A comprehensive user dashboard for managing personal details, social links, and cross-platform sync usernames.
**Official docs for the main library used:** [React useEffect](https://react.dev/reference/react/useEffect)

#### Code Walkthrough

**The "Setter Factory" Pattern**
- **What it is:** A function that *returns another function* specifically designed to update a single field in the state object.
- **Why it exists:** Instead of writing 15 separate functions for 15 different inputs, this one function handles them all dynamically based on the "field" name passed in.
- **How it's used here:** The `set(field)` function creates a reusable handler that takes a new `value` and merges it into the existing `profile` object.
- **Official docs:** [Functional State Updates](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state)
- **Mental model:** A machine that makes specialized stamps. You tell it "I need a Username stamp," and it hands you a stamp that only changes the username field.
- **Example from this codebase:**
```typescript
function set(field: keyof UserProfile) {
  return (value: string | number) =>
    setProfile(prev => ({ ...prev, [field]: value }))
}
```

**Section-Based Saving (`Record<string, boolean>`)**
- **What it is:** Using an object as a "map" to track the status (saving/saved) of multiple UI sections simultaneously.
- **Why it exists:** If a user clicks "Save" on their Bio, we only want *that* specific button to show "Saving...", not every save button on the page.
- **How it's used here:** `setSaving` and `setSaved` use keys like `'basic'`, `'bio'`, and `'social'` to isolate loading indicators.
- **Official docs:** [TypeScript Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)
- **Mental model:** A scorecard for a group of players. You only mark "Active" next to the person currently taking their turn.
- **Example from this codebase:**
`const [saving, setSaving] = useState<Record<string, boolean>>({})`

**`upsertProfile` Integration**
- **What it is:** Calling the helper utility to synchronize the local state with the Supabase database.
- **Why it exists:** To ensure that changes made on the screen actually persist when the user refreshes or logs in from another device.
- **How it's used here:** Inside `saveSection`, it sends only the relevant local fields to the backend API.
- **Official docs:** [Supabase Upsert](https://supabase.com/docs/reference/javascript/upsert)
- **Mental model:** Clicking "Commit" in a repository. You take your local changes and push them to the main server.
- **Example from this codebase:**
`await upsertProfile(user.id, fields)`

**⚠️ Common Mistakes:**
1. **Forgeting Null fallbacks**: If a database field is `null`, passing it directly to a text component can cause a crash. Always use `profile.name ?? ''`.
2. **Infinite Saving loops**: Forgetting to set `saving` back to `false` in the `finally` block (or catch) means the button will stay stuck on "Saving..." forever if the network fails.

---

### FILE: apps/web/src/App.tsx
**Purpose in one sentence:** The nervous system of the application, managing global initialization, real-time search filtering, and the orchestration of all functional modals.
**Official docs for the main library used:** [React useMemo](https://react.dev/reference/react/useMemo)

#### Code Walkthrough

**Initialization Orchestration**
- **What it is:** A startup sequence that runs immediately when the app boots to check if a user is logged in and to fetch the main data feed.
- **Why it exists:** To prevent the user from seeing a "flash" of an empty screen before the app knows their status.
- **How it's used here:** The `useEffect` calls `initialize()` (for auth) and `fetchIntel()` (for data) simultaneously.
- **Official docs:** [useEffect](https://react.dev/reference/react/useEffect)
- **Mental model:** A restaurant opening for the day. Before customers (UI) can eat, the staff must turn on the lights (`initialize`) and check the inventory (`fetchIntel`).
- **Example from this codebase:**
```typescript
useEffect(() => { 
  initialize(); 
  fetchIntel(); 
}, [initialize, fetchIntel]);
```

**Client-Side Intersection Search**
- **What it is:** Combining multiple independent filters (text search + format type + depth level) into a single result set.
- **Why it exists:** Users often want very specific results, like "A video course about SQL that is deep."
- **How it's used here:** A `useMemo` block that filters the `intel` array by checking three distinct conditions: `matchesSearch`, `matchesType`, and `matchesDepth`.
- **Official docs:** [Array filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- **Mental model:** Three physical filters stacked on top of each other. Only the items small enough (relevant enough) to pass through all three holes end up in the bucket at the bottom.
- **Example from this codebase:**
`return matchesSearch && matchesType && matchesDepth;`

**Modal Management State**
- **What it is:** Using "Active Object" state (like `intelForDoubt`) to determine which modal is open and what data it should show.
- **Why it exists:** Instead of having 50 booleans like `isDoubtModalOneOpen`, `isDoubtModalTwoOpen`, we just set `setIntelForDoubt(specificItem)`. If the variable has data, the modal opens with that data.
- **How it's used here:** Controlling the `DoubtSolverModal` and `ChallengeModal`.
- **Official docs:** [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- **Mental model:** A spotlight. Instead of having 10 lights, you have one spotlight and you point it at whichever actor (data) needs to be on stage right now.
- **Example from this codebase:**
`{intelForDoubt && <DoubtSolverModal intel={intelForDoubt} ... />}`

**⚠️ Common Mistakes:**
1. **Z-Index Wars**: If the `nav` has `z-40` and the modal has `z-30`, the menu will appear *on top* of the login box, making it impossible to click. Always ensure modals have the highest `z-index`.
2. **Dependency Omissions**: Forgetting to include `searchQuery` in the `useMemo` dependency array will result in the search results never changing when the user types, leading to a "broken" search bar.
3. **Double Initializations**: If you aren't careful with `useEffect`, you might call `fetchIntel()` twice, wasting user bandwidth and server resources. Always use empty arrays `[]` or stable hook functions as dependencies.
