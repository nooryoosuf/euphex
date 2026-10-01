// ─────────────────────────────────────────────────────────────
// EUPHEX publish proxy — Cloudflare Worker.
//
// Browser admin (euphex.mv/admin) POSTs edited JSON here.
// No login, no token in the browser: the Worker holds the GitHub token
// as an encrypted secret and commits to the repo.
//
// AUTH: open by default (owner's choice — anyone with the Worker URL can
// publish). To lock it down later, set the ADMIN_PASSCODE secret AND make
// the admin send { passcode } again — the check below activates.
//
// Deploy once via dashboard (no CLI needed):
//   Workers & Pages → Create → New Worker → paste this file → Deploy,
//   then Settings → Variables & Secrets:
//     ADMIN_PASSCODE = <same passcode as the admin screen>
//     GITHUB_TOKEN   = classic PAT, `repo` scope (needs `workflow`
//                      scope too if workflow files are ever touched —
//                      content JSONs don't need it)
//     GITHUB_OWNER   = nooryoosuf            (optional, this is default)
//     GITHUB_REPO    = euphex                (optional, this is default)
//     GITHUB_BRANCH  = main                  (optional, this is default)
//     ALLOWED_ORIGIN = https://euphex.mv      (optional, this is default)
// Then set the Worker URL in the admin Publish tab (or as
// NEXT_PUBLIC_PUBLISH_WORKER_URL at build time).
// ─────────────────────────────────────────────────────────────

const b64 = (s) => {
  const b = new TextEncoder().encode(s);
  let r = "";
  b.forEach((x) => (r += String.fromCharCode(x)));
  return btoa(r);
};

const safeEqual = (a, b) => {
  const x = String(a ?? "");
  const y = String(b ?? "");
  if (x.length !== y.length || x.length === 0) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
};

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

// Only content JSONs may be written through this proxy.
const ALLOWED_PATH = /^src\/data\/[A-Za-z0-9._-]+\.json$/;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = String(env.ALLOWED_ORIGIN || "https://euphex.mv")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true }, 200, cors);
    if (request.method !== "POST" || url.pathname !== "/publish") {
      return json({ error: "not found" }, 404, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad json" }, 400, cors);
    }

    // Open mode: passcode only enforced when ADMIN_PASSCODE is set.
    if (env.ADMIN_PASSCODE && !safeEqual(body.passcode, env.ADMIN_PASSCODE)) {
      return json({ error: "unauthorized" }, 401, cors);
    }

    const files = Array.isArray(body.files) ? body.files : [];
    if (files.length === 0 || files.length > 10) {
      return json({ error: "send 1–10 files" }, 400, cors);
    }

    if (!env.GITHUB_TOKEN) {
      return json({ error: "server missing GITHUB_TOKEN" }, 500, cors);
    }

    const owner = env.GITHUB_OWNER || "nooryoosuf";
    const repo = env.GITHUB_REPO || "euphex";
    const branch = body.branch || env.GITHUB_BRANCH || "main";
    const message = String(body.message || "Update site content via admin").slice(0, 140);
    const gh = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "euphex-publish-worker",
    };

    const results = [];
    for (const f of files) {
      if (!f || !ALLOWED_PATH.test(String(f.path || "")) || typeof f.content !== "string" || f.content.length > 500_000) {
        results.push({ path: String((f && f.path) || "?"), ok: false, error: "rejected" });
        continue;
      }
      const api = `https://api.github.com/repos/${owner}/${repo}/contents/${f.path}`;
      try {
        const cur = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers: gh });
        const sha = cur.ok ? (await cur.json()).sha : undefined;
        const put = await fetch(api, {
          method: "PUT",
          headers: gh,
          body: JSON.stringify({
            message: `${message} (${f.path})`,
            content: b64(f.content),
            ...(sha ? { sha } : {}),
            branch,
          }),
        });
        if (!put.ok) throw new Error(`${put.status} ${(await put.text()).slice(0, 200)}`);
        results.push({ path: f.path, ok: true });
      } catch (e) {
        results.push({ path: f.path, ok: false, error: String(e).slice(0, 200) });
      }
    }

    const ok = results.every((r) => r.ok);
    return json({ ok, results }, ok ? 200 : 502, cors);
  },
};
