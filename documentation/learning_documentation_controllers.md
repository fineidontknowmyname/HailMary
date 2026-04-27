# Project Hail Mary Learning Documentation: Backend Controllers

### FILE: apps/api/src/controllers/intel.controller.ts
**Purpose in one sentence:** Acts as the traffic cop for Intel requests, fetching raw data from the service layer and transforming it into a client-ready format.
**Official docs for the main library used:** [Express Request/Response](https://expressjs.com/en/api.html#req)

#### Code Walkthrough

**`catchAsync`**
- **What it is:** A utility wrapper function that catches errors in asynchronous route handlers and passes them to the next middleware.
- **Why it exists:** Standard Express doesn't automatically catch errors inside `async` functions. Without this, an unhandled rejection would crash the server or hang the request.
- **How it's used here:** Every controller method is wrapped in `catchAsync` to ensure any database or logic errors are safely caught by the `globalErrorHandler`.
- **Official docs:** [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- **Mental model:** A safety net under a tightrope walker; if they fall (error), the net (catchAsync) catches them so they don't hit the ground (crash the server).
- **Example from this codebase:**
`getAllIntel: catchAsync(async (req: Request, res: Response) => { ... })`

**`res.status(200).json(...)`**
- **What it is:** A method to set the HTTP status code and send a JSON response to the client.
- **Why it exists:** Communicates both the technical success/failure (via status code) and the actual data (via JSON) to the frontend.
- **How it's used here:** Sending back the list of "Intel" items with a `200 OK` status and a consistent response structure (`success`, `count`, `data`).
- **Official docs:** [res.json()](https://expressjs.com/en/api.html#res.json)
- **Mental model:** A restaurant server bringing a plate: the "200" is the "Enjoy your meal!" smile, and the "JSON" is the actual food on the plate.
- **Example from this codebase:**
```typescript
res.status(200).json({
  success: true,
  count: processedIntel.length,
  data: processedIntel
});
```

**⚠️ Common Mistakes:**
1. **Forgetting `.json()`**: Simply calling `res.status(200)` without sending data will leave the frontend waiting for a response that never arrives (hanging request).
2. **Hardcoding Status Codes**: A beginner might use `200` for an error instead of `400` or `500`, confusing the frontend logic that relies on HTTP status codes.

---

### FILE: apps/api/src/controllers/progress.controller.ts
**Purpose in one sentence:** Manages the persistent record of which "missions" a user has completed, handling the creation, retrieval, and deletion of progress records.
**Official docs for the main library used:** [Supabase Query Builder](https://supabase.com/docs/reference/javascript/select)

#### Code Walkthrough

**`req.body` vs `req.params`**
- **What it is:** `req.body` contains data sent in the request body (usually for `POST`/`PUT`), while `req.params` contains values from the URL path.
- **Why it exists:** `req.body` is for large or complex data transfers; `req.params` is for identifying specific resources in the URL.
- **How it's used here:** `markIntelComplete` reads the ID from `req.body` (POST), while `removeIntelProgress` reads it from `req.params` (DELETE).
- **Official docs:** [req.body](https://expressjs.com/en/api.html#req.body) | [req.params](https://expressjs.com/en/api.html#req.params)
- **Mental model:** `req.params` is the address on an envelope; `req.body` is the letter inside.
- **Example from this codebase:**
`const { intelId } = req.body;` (from markIntelComplete)
`const { intelId } = req.params;` (from removeIntelProgress)

**`.from().select().eq()`**
- **What it is:** The Supabase chaining pattern for querying the database. `.from('table')` sets the table, `.select('cols')` chooses columns, and `.eq('col', 'val')` filters for equality.
- **Why it exists:** Provides a programmatic way to write SQL-like queries without writing raw strings, making them typed and safer.
- **How it's used here:** Selecting only the completed mission columns for the current logged-in user.
- **Official docs:** [Supabase Select](https://supabase.com/docs/reference/javascript/select)
- **Mental model:** A filter at a library: "Go to the 'user_progress' section, select the 'title' cards, but only for the person named 'Alice'."
- **Example from this codebase:**
```typescript
await supabase
  .from('user_progress')
  .select('resource_id, completed_at...')
  .eq('user_id', user.id);
```

**`.upsert()`**
- **What it is:** A database operation that stands for "Update or Insert".
- **Why it exists:** Instead of checking "Does this record exist?" then choosing to `INSERT` or `UPDATE`, `upsert` handles both in one step based on a unique constraint.
- **How it's used here:** Marking a mission as complete. If the user already completed it, it updates the timestamp; otherwise, it creates a new record.
- **Official docs:** [Supabase Upsert](https://supabase.com/docs/reference/javascript/upsert)
- **Mental model:** Recording your high score. If you have one, overwrite it; if not, create a new entry.
- **Example from this codebase:**
`.upsert({ user_id: user.id, resource_id: intelId, ... });`

**⚠️ Common Mistakes:**
1. **Missing Filters (`.eq()`):** Forgetting `.eq('user_id', user.id)` on a delete request could accidentally delete *everyone's* progress if not caught by RLS (Row Level Security).
2. **Type Casting Issues:** Authenticated users are often attached to `req.user` in middleware. Forgetting the `(req as any).user` cast in TypeScript might lead to "Property 'user' does not exist on type 'Request'" errors.

---

### FILE: apps/api/src/controllers/profile.controller.ts
**Purpose in one sentence:** Interfaces between the user and their public/private profile data, ensuring users can only fetch and update their own information.
**Official docs for the main library used:** [Supabase Filters](https://supabase.com/docs/reference/javascript/eq)

#### Code Walkthrough

**`.single()`**
- **What it is:** A Supabase modifier that ensures the query returns exactly one object instead of an array.
- **Why it exists:** Simplifies the return type when you know only one match exists (like a unique user profile). If multiple are found, it returns an error.
- **How it's used here:** Fetching one profile linked to the unique `user_id`.
- **Official docs:** [Supabase Single](https://supabase.com/docs/reference/javascript/maybe-single)
- **Mental model:** "Don't give me a list of one thing, just give me the thing."
- **Example from this codebase:**
`.eq('user_id', user.id).single();`

**Error Code `PGRST116`**
- **What it is:** A specific PostgREST (the tech behind Supabase queries) error code meaning "Results contains 0 rows".
- **Why it exists:** When using `.single()`, having zero results is treated as an error.
- **How it's used here:** The code explicitly ignores this error because "no profile yet" is a valid state; we just return `null` so the frontend knows to show a blank profile.
- **Official docs:** [PostgREST Error Codes](https://postgrest.org/en/stable/errors.html)
- **Mental model:** "It's okay if the box is empty; don't set off the alarm."
- **Example from this codebase:**
`if (error && error.code !== 'PGRST116') { throw new Error(error.message); }`

**Destructuring Updates (`const { user_id, ...updates } = req.body`)**
- **What it is:** Using the "rest" operator (`...`) to pull everything *except* `user_id` out of an object.
- **Why it exists:** It prevents a malicious user from trying to change the `user_id` field in the request body to hijack someone else's profile.
- **How it's used here:** Stripping out any manual `user_id` from the payload and then manually injecting the *trusted* `user.id` from the auth token.
- **Official docs:** [Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- **Mental model:** Emptying a bag of groceries but throwing away the receipt so you can replace it with your own.
- **Example from this codebase:**
`const { user_id, ...updates } = req.body;`

**⚠️ Common Mistakes:**
1. **Trusting the Body:** Beginners often use `req.body.user_id` directly in their database query. A hacker can easily change this value in the request to modify other users' profiles. **Always** use the ID from the validated auth token (`req.user.id`).
2. **Not handling "Not Found":** If you don't check for `PGRST116`, your server might return a `500 Error` for new users who haven't set up a profile yet, causing the app to crash for them.
