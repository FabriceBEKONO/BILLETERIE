import { getStore } from "@netlify/blobs";
export const config = { path: ["/api/orders", "/api/confirm", "/api/scan"] };
const J = (d, s = 200) => Response.json(d, { status: s });
const S = (n) => getStore({ name: n, consistency: "strong" });
export default async (req) => {
  const p = new URL(req.url).pathname, k = req.headers.get("x-key");
  const admin = !!k && k === process.env.ADMIN_KEY;
  const scan = admin || (!!k && k === process.env.SCAN_KEY);
  const o = S("orders"), t = S("tickets"), used = S("used");
  if (p === "/api/orders" && admin) {
    const { blobs } = await o.list();
    const all = await Promise.all(blobs.map((b) => o.get(b.key, { type: "json" })));
    return J(all.filter(Boolean).sort((a, b) => b.at - a.at));
  }
  if (p === "/api/confirm" && admin && req.method === "POST") {
    const { id, action } = await req.json(), ord = await o.get(String(id), { type: "json" });
    if (!ord) return J({ error: "Introuvable" }, 404);
    if (action === "reject") ord.status = "rejected";
    else if (ord.status === "pending") {
      ord.codes = [];
      for (let i = 0; i < ord.qty; i++) {
        const code = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        await t.setJSON(code, { name: ord.name, label: ord.label, order: ord.ref });
        ord.codes.push(code);
      }
      ord.status = "paid";
    }
    await o.setJSON(ord.id, ord);
    return J(ord);
  }
  if (p === "/api/scan" && scan && req.method === "POST") {
    const { code } = await req.json().catch(() => ({})), c = String(code ?? "").trim().toLowerCase();
    const tk = /^[a-f0-9]{16}$/.test(c) ? await t.get(c, { type: "json" }) : null;
    if (!tk) return J({ ok: false, reason: "Billet inconnu" });
    const r = await used.set(c, String(Date.now()), { onlyIfNew: true });
    if (!r.modified) return J({ ok: false, reason: "Déjà utilisé", ...tk, at: Number(await used.get(c)) });
    return J({ ok: true, ...tk });
  }
  return J({ error: "Accès refusé" }, 401);
};
