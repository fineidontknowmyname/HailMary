# Project Hail Mary Learning Documentation: Backend

### FILE: apps/api/src/index.ts
**Purpose in one sentence:** The main entry point for the Express server, setting up database connections, global middleware, routes, and starting the HTTP listener.
**Official docs for the main library used:** [Express Docs](https://expressjs.com/)

#### Code Walkthrough

**`app.use()`**
- **What it is:** A function that mounts middleware functions or routers at a specified path in the Express sequence.
- **Why it exists:** Express processes requests through a pipeline/chain. `app.use` allows you to insert logic to inspect or modify all incoming requests before they hit your custom route controllers.
- **How it's used here:** To globally apply CORS rules, parse JSON bodies, and register the prefixed API routers (e.g., routing everything starting with `/api/intel` to `intelRoutes`).
- **Official docs:** [app.use](https://expressjs.com/en/api.html#app.use)
- **Mental model:** Setting up dedicated inspection stations linearly along a factory assembly line.
- **Example from this codebase:**
`app.use('/api/intel', intelRoutes);`

**`express.json()`**
- **What it is:** A built-in middleware function in Express that specifically parses incoming requests containing JSON payloads.
- **Why it exists:** HTTP requests arrive over the network as raw text streams. This instantly converts `{"name": "Alice"}` text blocks into a usable, native JavaScript object attached to `req.body`.
- **How it's used here:** Applied globally at the top so any incoming `POST` or `PUT` requests carrying JSON payloads can be effortlessly read by the route handlers downstream.
- **Official docs:** [express.json](https://expressjs.com/en/api.html#express.json)
- **Mental model:** A translator sitting at the front door that intercepts foreign messages (raw JSON text) and translates them into your native language (JavaScript Objects).
- **Example from this codebase:**
`app.use(express.json());`

**`cors()`**
- **What it is:** A middleware module enabling Cross-Origin Resource Sharing.
- **Why it exists:** Browsers strictly block frontend web apps from sending API requests to totally different domains or ports by default for security. CORS tells the browser "It's safe, I explicitly allow requests originating from that specific frontend."
- **How it's used here:** Whitelisting local development (`localhost:5173`) and the production deployment (`hailmary.vercel.app`) to interact with this API, while permitting secure auth credentials to pass through.
- **Official docs:** [cors](https://expressjs.com/en/resources/middleware/cors.html)
- **Mental model:** A bouncer at a secure club diligently checking an exclusive VIP guest list.
- **Example from this codebase:**
```tsx
app.use(cors({
  origin: ['http://localhost:5173', 'https://hailmary.vercel.app'],
  credentials: true,
}));
```

**`setInterval`**
- **What it is:** A native global JavaScript method that repeatedly executes a function bloc with a fixed time delay between each call.
- **Why it exists:** For scheduling recurring background tasks independent of user interaction.
- **How it's used here:** In a production environment, it pings the server's own health endpoint strictly every 14 minutes. This prevents cloud hosting providers' free-tiers (like Render) from automatically spinning down the service due to inactivity.
- **Official docs:** [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- **Mental model:** An automated metronome ticking quietly, triggering an action rigorously on every scheduled beat.
- **Example from this codebase:**
`setInterval(async () => { ... }, 14 * 60 * 1000);`

**⚠️ Common Mistakes:**
1. **Middleware Ordering:** Beginners routinely place error handling middleware (`app.use(globalErrorHandler)`) *before* their standard routes. In Express, middleware completely executes sequentially top-to-bottom, meaning global error handlers must always be anchored at the very end of the file.
2. **Missing `cors` Credentials:** Forgetting to declare `credentials: true` will cause authorization headers or strict cookies sent by the frontend to be automatically stripped or permanently rejected by restrictive browsers.

---

### FILE: apps/api/src/lib/supabase.ts
**Purpose in one sentence:** Securely initializes the global Supabase admin client strictly used to interface with the cloud database directly from the Node backend.
**Official docs for the main library used:** [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

#### Code Walkthrough

**`createClient()`**
- **What it is:** The factory function that takes a Supabase project URL and an API key to return a fully connected client instance.
- **Why it exists:** Internally bootstraps the active connection so subsequent API calls like `supabase.from('...')` magically know how to seamlessly route to your specific cloud database.
- **How it's used here:** Setting up the singular exported `supabase` constant utilizing environment variables containing the secure keys.
- **Official docs:** [createClient](https://supabase.com/docs/reference/javascript/initializing)
- **Mental model:** Picking up a secure landline, dialing the phone number, and entering your admin access code to patch directly into the vault.
- **Example from this codebase:**
```typescript
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

**⚠️ Common Mistakes:**
1. **Exposing the Service Key:** If a developer accidentally leaks or utilizes the raw `service_role` key on the frontend side, it entirely bypasses Row Level Security (RLS) algorithms. This exact environment variable initialization firmly belongs exclusively on the backend API.
2. **Missing Environment Variables Check:** Without the rigid `if (!process.env...) throw new Error()` check placed immediately preceding initialization, if the `.env` file isn't loaded correctly, the server might boot cleanly but then silently crash on the very first database interaction.

---

### FILE: apps/api/src/middleware/auth.ts
**Purpose in one sentence:** An Express middleware guard that rigorously intercepts protective API requests to verify a user's Supabase JWT token before allowing access to private backend routes.
**Official docs for the main library used:** [Express Middleware](https://expressjs.com/en/guide/writing-middleware.html)

#### Code Walkthrough

**Express Middleware Pattern (`req`, `res`, `next`)**
- **What it is:** A strict function signature specifically taking the incoming request (`req`), the active response (`res`), and a `next` callback.
- **Why it exists:** Allows decoupled, modular logic to intercept and meticulously inspect requests. If valid, the code calls `next()` to smoothly pass control to the actual route handler. If entirely invalid, it utilizes `res.status(...).json(...)` to immediately reject the request.
- **How it's used here:** It checks if a standard HTTP 'Authorization' header exists and is validly formatted. If verification fails, it permanently returns a `401 Unauthorized` standard JSON response.
- **Official docs:** [Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- **Mental model:** A physical security checkpoint. You either present your valid ID to continue walking inside (`next()`), or you get turned away entirely (`res.json()`).
- **Example from this codebase:**
`export async function requireAuth(req: Request, res: Response, next: NextFunction)`

**`supabase.auth.getUser()`**
- **What it is:** A Supabase admin function that rigorously confirms the cryptographic validation of a standard JSON Web Token (JWT) directly via the Supabase Auth server architecture.
- **Why it exists:** Securely guards the backend by verifying the specific token originally routed by the frontend was genuinely minted by Supabase, hasn't been tampered with, and fundamentally hasn't timed out.
- **How it's used here:** It accepts the deeply extracted `token` segment, formally executes validation, and returns the underlying, trusted user identity payload.
- **Official docs:** [getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- **Mental model:** Scanning a physical ID badge dynamically at a digital barcode reader specifically to ensure it isn't an outright forgery.
- **Example from this codebase:**
`const { data, error } = await supabase.auth.getUser(token)`

**TypeScript casting (`as any`)**
- **What it is:** An assertive type command blatantly instructing the strict TypeScript compiler to fully ignore regular internal type safeguards and treat the targeted object as completely untyped (`any`).
- **Why it exists:** The default rigid Express `Request` type signature inherently does not declare a customized `.user` trait by factory default.
- **How it's used here:** Aggressively forcing TypeScript to allow appending the securely validated Supabase `data.user` entity to the core `req` chain, so downstream route endpoints can quickly rely on `req.user.id`.
- **Official docs:** [Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- **Mental model:** Telling a strict inspector, "I implicitly know exactly what I'm executing, trust me totally, stop verifying the base rules momentarily."
- **Example from this codebase:**
`;(req as any).user = data.user`

**⚠️ Common Mistakes:**
1. **Forgetting `.split(' ')[1]` Formatting:** Standard HTTP `Authorization` headers conventionally start exactly with the prefix phrase `Bearer eyJ...`. If an inexperienced developer passes the whole literal string heavily intact strictly to `getUser`, it catastrophically fails validation every time.
2. **Forgetting to invoke `next()`:** If identity validation firmly passes successfully but a developer actively forgets to manually execute `next()`, the pipeline entirely grinds to a halt. The API request will hang infinitely, eventually yielding a frustrating client-side timeout error.
