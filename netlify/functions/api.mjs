import { getStore } from "@netlify/blobs";
import ev from "../../config/event.mjs";
export const config = { path: ["/api/info", "/api/order", "/api/ticket"] };
const J = (d, s = 200) => Response.json(d, { status: s });
const S = (n) => getStore({ name: n, consistency: "strong" });
export default async (req) => {
  const u = new URL(req.url), o = S("orders");
  if (u.pathname === "/api/info") return J(ev);
  if (u.pathname === "/api/order" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const c = ev.categories.find((x) => x.id === b.category), q = Math.floor(+b.qty);
    const name = String(b.name || "").trim().slice(0, 80), phone = String(b.phone || "").trim().slice(0, 20);
    if (!c || !name || phone.length < 8 || !(q >= 1 && q <= ev.maxPerOrder)) return J({ error: "Informations invalides" }, 400);
    const id = crypto.randomUUID(), ref = id.slice(0, 5).toUpperCase();
    await o.setJSON(id, { id, ref, name, phone, label: c.label, qty: q, total: c.price * q, status: "pending", at: Date.now() });
    return J({ id, ref, total: c.price * q });
  }
  if (u.pathname === "/api/ticket") {
    const id = u.searchParams.get("o"), ord = id ? await o.get(id, { type: "json" }) : null;
    if (!ord) return J({ error: "Commande introuvable" }, 404);
    const { phone, ...pub } = ord;
    return J({ order: pub });
  }
  return J({ error: "Introuvable" }, 404);
};
