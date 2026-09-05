import { createHash } from "node:crypto";
import { isValidEmail } from "../lib/email.js";
import { firstForwardedIp, isolateLimit } from "../lib/rate-limit.js";

const GENERIC_OK = { ok: true };

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }
  return {};
}

function field(value) {
  return typeof value === "string" ? value.trim() : "";
}

function userAgentHash(req) {
  const ua = field(req.headers["user-agent"]);
  if (!ua) return "";
  return createHash("sha256").update(ua).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    res.status(400).json({ ok: false });
    return;
  }

  if (field(body.website)) {
    res.status(200).json(GENERIC_OK);
    return;
  }

  const name = field(body.name);
  const email = field(body.email);
  const country = field(body.country);

  if (!name || !country || !isValidEmail(email)) {
    res.status(400).json({ ok: false });
    return;
  }

  const ip = firstForwardedIp(req.headers) || req.socket?.remoteAddress || "unknown";
  if (!isolateLimit.allow(ip)) {
    res.status(429).json({ ok: false });
    return;
  }

  const secret = process.env.WAITLIST_SHARED_SECRET;
  const webhookUrl = process.env.N8N_WAITLIST_WEBHOOK_URL;
  if (!secret || !webhookUrl) {
    res.status(200).json(GENERIC_OK);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NIWL-Secret": secret,
      },
      body: JSON.stringify({
        name,
        email,
        country,
        source: "niwl-web",
        user_agent_hash: userAgentHash(req),
      }),
    });
  } catch {
    // Backend failures stay generic. Never leak upstream errors.
  }

  res.status(200).json(GENERIC_OK);
}
