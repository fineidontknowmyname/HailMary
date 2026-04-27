# Project Hail Mary Learning Documentation: Backend Routes

*(Note: In the codebase, the physical files are named `intel.routes.ts`, `progress.routes.ts`, and `profile.routes.ts` instead of `resources.ts`, `progress.ts`, and `profile.ts`.)*

### FILE: apps/api/src/routes/intel.routes.ts
**Purpose in one sentence:** Defines the publicly accessible "get all resources" endpoint for fetching the curated learning materials.
**Official docs for the main library used:** [Express Routing](https://expressjs.com/en/guide/routing.html)

#### Code Walkthrough

**`Router()` (Express)**
- **What it is:** A class included with Express used to create modular, mountable route handlers.
- **Why it exists:** Instead of writing hundreds of `app.get()` lines inside the main `index.ts` file, you can break routes into logical files as "mini-applications".
- **How it's used here:** Creating an isolated router just for Intel-related paths. This router gets exported and then dynamically attached to the `/api/intel` prefix back inside `index.ts`.
- **Official docs:** [express.Router](https://expressjs.com/en/4x/api.html#router)
- **Mental model:** A physical mail-sorting sub-station. The main post office (`index.ts`) sends all mail addressed to "Intel" here, and this machine sorts it further.
- **Example from this codebase:**
`const router = Router();`

**`router.get()`**
- **What it is:** An HTTP GET method route definition.
- **Why it exists:** Defines exactly what JavaScript function should run when a browser or frontend requests data from this specific URL.
- **How it's used here:** Catching incoming `GET` requests to the root path (`/`) of this specific router (which evaluates out to `/api/intel`) and forcefully handing them off to the `IntelController.getAllIntel` function.
- **Official docs:** [router.METHOD](https://expressjs.com/en/api.html#router.METHOD)
- **Mental model:** A receptionist's desk directory: "If anyone asks simply to 'GET' the default menu, explicitly send them to the Intel Controller downstairs."
- **Example from this codebase:**
`router.get('/', IntelController.getAllIntel);`

**⚠️ Common Mistakes:**
1. **Calling the Controller manually:** A beginner might accidentally write `router.get('/', IntelController.getAllIntel())` strictly invoking the method immediately upon server start rather than passing the reference. Express natively needs the *function definition* to run it later when a request finally arrives.

---

### FILE: apps/api/src/routes/progress.routes.ts
**Purpose in one sentence:** Establishes highly secure endpoints permitting a logged-in user to fetch their mission completions, check off new materials, or safely un-mark them.
**Official docs for the main library used:** [Express Routing](https://expressjs.com/en/guide/routing.html)

#### Code Walkthrough

**Middleware Pattern / Chaining (`requireAuth`)**
- **What it is:** In Express, you can pass multiple handler functions in a single route definition, separated by commas.
- **Why it exists:** It efficiently stacks reusable security checks gracefully in front of the actual main controller. If `requireAuth` organically fails (the user token is missing or expired), the chain stops and `ProgressController` is safely never executed.
- **How it's used here:** Strictly placed before the controller on all three routes (`GET`, `POST`, `DELETE`) to ensure absolutely no unauthenticated guests can manipulate the mission database.
- **Official docs:** [Route handlers](https://expressjs.com/en/guide/routing.html#route-handlers)
- **Mental model:** Installing a locked vault door right in front of the teller booth. You must successfully clear the vault (`requireAuth`) before you can even talk to the teller (`ProgressController`).
- **Example from this codebase:**
`router.get('/', requireAuth, ProgressController.getMissionLog);`

**HTTP Verbs (`GET` vs `POST` vs `DELETE`)**
- **What it is:** Semantic standardized methods explaining the intent of a network request.
- **Why it exists:** Even though the URL route (`/`) is identical for the first two routes, the server successfully knows entirely different functions should handle "fetching data" (`GET`), "creating new data" (`POST`), and "removing data" (`DELETE`).
- **How it's used here:** Delineating retrieving the history log versus heavily writing a new completion payload to the database.
- **Official docs:** [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- **Mental model:** Submitting an official "Request Info" form versus an "Add Cash" form at the exact same physical bank window.
- **Example from this codebase:**
```typescript
router.get('/', requireAuth, ProgressController.getMissionLog);
router.post('/', requireAuth, ProgressController.markIntelComplete);
```

**Route Parameters (`/:intelId`)**
- **What it is:** Dynamic segments embedded deeply into the URL path string.
- **Why it exists:** So a frontend easily can pass exactly which specific item to delete without heavily inserting it into a bulky JSON request payload.
- **How it's used here:** When the frontend fires a request securely to `/api/progress/12345`, Express automatically captures `12345` inside an object named `req.params.intelId` for the delete controller to confidently read.
- **Official docs:** [Route parameters](https://expressjs.com/en/guide/routing.html#route-parameters)
- **Mental model:** A blank line on a form: "Delete item ID: \_\_\_\_\_\_\_ ".
- **Example from this codebase:**
`router.delete('/:intelId', requireAuth, ProgressController.removeIntelProgress);`

**⚠️ Common Mistakes:**
1. **Misnaming Route Parameters:** If the controller file expects to read `req.params.id` strictly but the route explicitly declared the URL parameter string as `/:intelId`, it generates a silent backend failure trying to process undefined data.

---

### FILE: apps/api/src/routes/profile.routes.ts
**Purpose in one sentence:** Defines the secure API paths for reading the current user's profile metadata or forcibly updating it.
**Official docs for the main library used:** [Express Routing](https://expressjs.com/en/guide/routing.html)

#### Code Walkthrough

**`put()` (HTTP PUT Method)**
- **What it is:** An HTTP method traditionally utilized for safely updating or replacing resource payloads on a backend server.
- **Why it exists:** Distinct from `POST` (usually "create new record"), `PUT` signifies "take this specific existing resource and aggressively update its contents with this fresh payload".
- **How it's used here:** To accept the frontend's profile modifications (like updating the bio or social links) effectively updating the associated database rows.
- **Official docs:** [router.put](https://expressjs.com/en/api.html#router.put)
- **Mental model:** Submitting a completely filled-out change of address card to the post office.
- **Example from this codebase:**
`router.put('/', requireAuth, ProfileController.updateProfile);`

**⚠️ Common Mistakes:**
1. **Import typos breaking logic:** Beginners might accidentally copy/paste routes heavily and leave `ProfileController.getProfile` assigned to both `GET` and `PUT` accidentally, stopping updates from ever executing correctly without visible console errors.
