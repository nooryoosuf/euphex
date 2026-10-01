# EUPHEX publish Worker

Lets `/admin` publish content edits to GitHub with **no token in the browser**.
The admin sends `{ passcode, branch, message, files }`; the Worker verifies
the passcode and commits via the GitHub API using `GITHUB_TOKEN` (secret).

## Deploy (dashboard, ~3 min, no CLI)

1. Cloudflare Dash → **Workers & Pages** → **Create** → **Create Worker** →
   name it `euphex-publish` → **Deploy** (placeholder first).
2. **Edit code** → delete everything → paste `publish.js` → **Save and deploy**.
3. **Settings → Variables & Secrets** → add:
   - `GITHUB_TOKEN` (secret) — classic PAT, `repo` scope. Content JSONs
     don't touch workflows, so `workflow` scope is NOT needed here.
   - Optional: `ADMIN_PASSCODE` (secret) — leave UNSET for open publishing
     (no password anywhere). Set it later to require a passcode.
   - Optional plain-text vars: `GITHUB_OWNER` (default `nooryoosuf`),
     `GITHUB_REPO` (default `euphex`), `GITHUB_BRANCH` (default `main`),
     `ALLOWED_ORIGIN` (default `https://euphex.mv`).
4. Copy the Worker URL: `https://euphex-publish.<your-account>.workers.dev`
5. Open `https://euphex.mv/admin` → **Publish** tab → paste URL once
   (remembered per tab) → edit content → **Publish**. No passwords.
   (Send the URL to your dev to bake in as `NEXT_PUBLIC_PUBLISH_WORKER_URL`
   so the field comes prefilled after the next site deploy.)

## Test

- `GET https://<worker>/health` → `{"ok":true}`
- Wrong passcode POST → `401 unauthorized`
- Only `src/data/*.json` paths are accepted; max 10 files, 500 KB each.

## CLI alternative

`npx wrangler deploy` from this folder (uses `wrangler.toml`),
then `npx wrangler secret put ADMIN_PASSCODE` / `GITHUB_TOKEN`.
