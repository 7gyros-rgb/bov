import { writeState } from "../../lib/store";
import { defaultState } from "../../lib/defaultState";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const adminKey = req.headers["x-admin-key"];
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return res.status(500).json({
      error: "ADMIN_PASSWORD is not set on the server.",
    });
  }
  if (adminKey !== expected) {
    return res.status(401).json({ error: "Wrong admin password." });
  }

  const saved = await writeState(defaultState());
  return res.status(200).json(saved);
}
