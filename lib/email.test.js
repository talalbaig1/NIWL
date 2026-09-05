import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "./email.js";

test("accepts a normal email shape", () => {
  assert.equal(isValidEmail("ada@example.com"), true);
});

test("trims surrounding space", () => {
  assert.equal(isValidEmail("  ada@example.com  "), true);
});

test("rejects missing at-sign", () => {
  assert.equal(isValidEmail("ada.example.com"), false);
});

test("rejects missing domain dot", () => {
  assert.equal(isValidEmail("ada@localhost"), false);
});

test("rejects spaces inside the address", () => {
  assert.equal(isValidEmail("ada example@host.com"), false);
});

test("rejects empty and non-strings", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("   "), false);
  assert.equal(isValidEmail(null), false);
  assert.equal(isValidEmail(undefined), false);
});

test("rejects consecutive dots", () => {
  assert.equal(isValidEmail("ada@ex..ample.com"), false);
});
