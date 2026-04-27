# Project Hail Mary Learning Documentation: UI Components

### FILE: apps/web/src/components/AuthModal.tsx
**Purpose in one sentence:** A centralized modal that allows users to toggle between "Login" and "Sign up" logic, handling all authentication UI states and user feedback.
**Official docs for the main library used:** [React Forms](https://react.dev/learn/sharing-state-between-components)

#### Code Walkthrough

**`mode` Switch (`useState`)**
- **What it is:** A local state variable (`'login' | 'signup'`) that determines which form version is visible to the user.
- **Why it exists:** Instead of creating two separate models, combining them into one component makes the code cleaner and allows for smooth transitions between "Log in" and "Create account".
- **How it's used here:** It dynamically changes button labels, API calls (signIn vs. signUp), and text descriptions.
- **Official docs:** [useState](https://react.dev/reference/react/useState)
- **Mental model:** A reversible jacket. You flip it inside out whenever you want to switch styles, but it's fundamentally the same piece of clothing.
- **Example from this codebase:**
`const [mode, setMode] = useState<'login' | 'signup'>('login')`

**`e.preventDefault()` (Form Handling)**
- **What it is:** A standard JavaScript method that prevents the browser's default form submission behavior (which typically reloads the entire page).
- **Why it exists:** In modern React "Single Page Applications" (SPAs), we want to handle the data submission via JavaScript (AJAX/Fetch) without ever leaving or refreshing the page.
- **How it's used here:** Inside `handleSubmit`, it stops the page from refreshing so the `signIn` or `signUp` logic can execute.
- **Official docs:** [MDN - preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- **Mental model:** Intercepting a letter before it’s mailed so you can personally deliver it yourself rather than letting the post office take it.
- **Example from this codebase:**
`async function handleSubmit(e: React.FormEvent) { e.preventDefault(); ... }`

**Backdrop Click to Close**
- **What it is:** A UX pattern where clicking the darkened area *outside* a modal closes it.
- **Why it exists:** It provides a natural, intuitive way for users to dismiss a modal beyond just clicking a "Close" button.
- **How it's used here:** By checking `if (e.target === e.currentTarget)`, the modal ensures it only closes if you click the *blur* itself, and not when you click something *inside* the login box.
- **Official docs:** [Event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling)
- **Mental model:** A physical door. Touching the frame (backdrop) doesn't do anything, but pushing the wall (currentTarget) trigger the exit.
- **Example from this codebase:**
`onClick={e => { if (e.target === e.currentTarget) onClose() }}`

**⚠️ Common Mistakes:**
1. **Missing `type="submit"`**: If the "Log in" button isn't marked as `submit`, pressing the "Enter" key won't trigger the login function automatically.
2. **Hardcoded Errors**: A beginner might forget to clear the `error` state when switching from Login to Signup, leaving old "Invalid Credentials" warnings visible in the wrong context.

---

### FILE: apps/web/src/components/FilterBar.tsx
**Purpose in one sentence:** A reusable navigation component that syncs search queries and category filters across the entire resource grid.
**Official docs for the main library used:** [Lifting State Up](https://react.dev/learn/sharing-state-between-components#lifting-state-up)

#### Code Walkthrough

**Controlled Inputs (props sync)**
- **What it is:** A pattern where a component's value is controlled by its parent's state, passed down through props.
- **Why it exists:** To ensure that if a user types something in a search bar at the *top* of the page, the *bottom* of the page knows exactly what to filter.
- **How it's used here:** The `FilterBar` doesn't "own" the search query; it simply reports changes back to the parent `App.tsx` using `setSearchQuery`.
- **Official docs:** [Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- **Mental model:** A terminal screen. The keyboard sends signals to the CPU (Parent), and the CPU tells the screen exactly what to show.
- **Example from this codebase:**
`value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}`

**Conditional Styling (Tailwind template literals)**
- **What it is:** Using standard JavaScript string templates to dynamically apply different CSS classes based on state.
- **Why it exists:** To give users visual feedback (e.g., highlighting the "ALL" button when no filter is active).
- **How it's used here:** Checking `selectedType` to swap between a green active color or a dark inactive color.
- **Official docs:** [Conditional classes](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)
- **Mental model:** A highlighter. You only turn it on when the specific word is relevant to what you're currently reading.
- **Example from this codebase:**
`className={`... ${!selectedType ? 'bg-[#4fffb0] text-black...' : 'bg-[#161b27]...'}`} `

**⚠️ Common Mistakes:**
1. **Forgetting keys in .map()**: When looping through `types` to make buttons, forgetting the `key={type}` prop will cause React to lose track of which button was clicked in a large list.
2. **Prop Drilling**: Passing too many levels of props can get messy. If this filter system was 5 levels deep, we would use Zustand or Context instead.

---

### FILE: apps/web/src/components/ExternalResourceCard.tsx
**Purpose in one sentence:** A "state-aware" card that tracks if a user has opened a link and provides a follow-up "Verify & Complete" gateway.
**Official docs for the main library used:** [window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)

#### Code Walkthrough

**`window.open` (External Links)**
- **What it is:** A native web API used to open a URL in a new browser tab or window.
- **Why it exists:** Because "missions" are often external tutorials or videos, we want the user to explore them without losing their place in Project Hail Mary.
- **How it's used here:** In `handleLaunch`, it opens the learning material and simultaneously flags the UI that the user has started the mission.
- **Official docs:** [window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
- **Mental model:** Launching a rocket. You push the button, the rocket goes off to space (new tab), and you stay behind at mission control.
- **Example from this codebase:**
`window.open(intel.link, '_blank', 'noopener,noreferrer');`

**Conditional UI States (The Gateway Pattern)**
- **What it is:** Showing different interactive elements based on the progress of an action.
- **Why it exists:** To guide the user through a multi-step process: First "Launch", then "Confirm Completion".
- **How it's used here:** The `!hasLaunched` check toggles between the blue "Launch" button and the green "Verify & Complete" verification gate.
- **Official docs:** [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- **Mental model:** A toll booth. The gate stays down until you've successfully approached from the road (launched the material).
- **Example from this codebase:**
`{!hasLaunched ? (/* Launchpad */) : (/* Gateway */)}`

**⚠️ Common Mistakes:**
1. **Missing Security attributes**: Forgetting `'noopener,noreferrer'` on `window.open` can lead to security vulnerabilities where the opened page might gain control over your app.
2. **Stale State**: If a user closes the external tab and comes back, the card will stay in the "Return State". A beginner might forget to add a "Go Back" button, effectively locking the user out of reopening the link.

---

### FILE: apps/web/src/components/SkeletonCard.tsx
**Purpose in one sentence:** A placeholder component that mimics the layout of a real card using animations to provide visual feedback during loading states.
**Official docs for the main library used:** [Tailwind Animate Pulse](https://tailwindcss.com/docs/animation#pulse)

#### Code Walkthrough

**`animate-pulse` (Visual Feedback)**
- **What it is:** A built-in Tailwind animation that gently fades the opacity of an element in a loop.
- **Why it exists:** It feels more professional and less "broken" than a blank screen or a simple spinner. It tells the user "data is coming, and it will look like this".
- **How it's used here:** Applied to the entire card container to make all the gray placeholder boxes "breathe" together.
- **Official docs:** [Pulse Animation](https://tailwindcss.com/docs/animation#pulse)
- **Mental model:** A heartbeat. It shows the application is alive and working, even if it hasn't produced the "food" (data) yet.
- **Example from this codebase:**
`className="... animate-pulse"`

**Fixed Aspect Ratios (`aspect-video`)**
- **What it is:** Ensuring the placeholder box has the exact same dimensions as the final thumbnail image.
- **Why it exists:** To prevent "layout shift". If the skeleton is the wrong shape, the page will "jump" once the real images load, which is frustrating for users.
- **How it's used here:** To reserve a consistent 16:9 space at the top of the card.
- **Official docs:** [Aspect Ratio](https://tailwindcss.com/docs/aspect-ratio)
- **Mental model:** Reserving a parking spot. You put an orange cone (skeleton) there so nothing else takes the space until your car (real data) arrives.
- **Example from this codebase:**
`<div className="aspect-video w-full bg-[#111520]"></div>`

**⚠️ Common Mistakes:**
1. **Over-complexity**: Skeletons should be simple. Trying to animate specific tiny details often leads to jittery performance on lower-end devices.
2. **Color Mismatch**: If the skeleton colors don't match the background of the real card, the transition will look "staccato" and jarring rather than smooth and professional.
