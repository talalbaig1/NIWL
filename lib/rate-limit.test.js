import { test } from "node:test";
import assert from "node:assert/strict";
import { IsolateRateLimit, firstForwardedIp } from "./rate-limit.js";

test("allows five hits then blocks the sixth for one IP", () => {
  const limit = new IsolateRateLimit({ now: () => 1_000_000 });
  for (let i = 0; i < 5; i += 1) {
    assert.equal(limit.allow("203.0.113.9"), true);
  }
  assert.equal(limit.allow("203.0.113.9"), false);
});

test("counts IPs independently", () => {
  const limit = new IsolateRateLimit({ now: () => 1_000_000 });
  for (let i = 0; i < 5; i += 1) {
    assert.equal(limit.allow("203.0.113.1"), true);
  }
  assert.equal(limit.allow("203.0.113.2"), true);
  assert.equal(limit.allow("203.0.113.1"), false);
});

test("window expiry frees a slot", () => {
  let now = 0;
  const limit = new IsolateRateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,
    now: () => now,
  });
  for (let i = 0; i < 5; i += 1) {
    assert.equal(limit.allow("203.0.113.9"), true);
  }
  assert.equal(limit.allow("203.0.113.9"), false);
  now = 15 * 60 * 1000 + 1;
  assert.equal(limit.allow("203.0.113.9"), true);
});

test("firstForwardedIp uses the first hop only", () => {
  assert.equal(
    firstForwardedIp({ "x-forwarded-for": "203.0.113.9, 10.0.0.2" }),
    "203.0.113.9"
  );
  assert.equal(firstForwardedIp({}), "");
});
