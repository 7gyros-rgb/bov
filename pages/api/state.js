import { readState, writeState, isKvConfigured } from "../../lib/store";

export default async function handler(req, res) {
  // Overlay/admin polling should never get cached by the browser or a CDN.
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const state = await readState();
    return res.status(200).json({ ...state, kvConfigured: isKvConfigured() });
  }

  if (req.method === "POST") {
    const adminKey = req.headers["x-admin-key"];
    const expected = process.env.ADMIN_PASSWORD || "";
    if (!expected) {
      return res.status(500).json({
        error:
          "ADMIN_PASSWORD is not set on the server. Add it in Vercel → Settings → Environment Variables.",
      });
    }
    if (adminKey !== expected) {
      return res.status(401).json({ error: "Wrong admin password." });
    }

    const body = req.body;
    if (!body || !Array.isArray(body.teams)) {
      return res.status(400).json({ error: "Invalid payload." });
    }

    const saved = await writeState({ teams: body.teams });
    return res.status(200).json({ ...saved, kvConfigured: isKvConfigured() });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
