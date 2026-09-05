const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;

export class IsolateRateLimit {
  constructor({ max = MAX_HITS, windowMs = WINDOW_MS, now = Date.now } = {}) {
    this.max = max;
    this.windowMs = windowMs;
    this.now = now;
    this.hits = new Map();
  }

  allow(ip) {
    const key = ip || "unknown";
    const cutoff = this.now() - this.windowMs;
    const prior = (this.hits.get(key) || []).filter((ts) => ts > cutoff);
    if (prior.length >= this.max) {
      this.hits.set(key, prior);
      return false;
    }
    prior.push(this.now());
    this.hits.set(key, prior);
    return true;
  }
}

export function firstForwardedIp(headers = {}) {
  const raw = headers["x-forwarded-for"] ?? headers["X-Forwarded-For"];
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",")[0].trim();
  }
  return "";
}

export const isolateLimit = new IsolateRateLimit();
