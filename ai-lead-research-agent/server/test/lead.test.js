import test from "node:test";
import assert from "node:assert/strict";
import { researchRequestSchema, reviewSchema } from "../src/schemas/lead.schemas.js";

test("uses a supported default OpenAI model", async () => {
  const original = process.env.OPENAI_MODEL;
  delete process.env.OPENAI_MODEL;

  try {
    const { env } = await import(new URL("../src/config/env.js?default-model-test", import.meta.url).href);
    assert.equal(env.OPENAI_MODEL, "gpt-4o-mini");
  } finally {
    if (original === undefined) {
      delete process.env.OPENAI_MODEL;
    } else {
      process.env.OPENAI_MODEL = original;
    }
  }
});

test("accepts a valid company input", () => {
  const result = researchRequestSchema.parse({
    company: "https://stripe.com"
  });

  assert.equal(result.company, "https://stripe.com");
});

test("rejects an empty company input", () => {
  assert.throws(() => {
    researchRequestSchema.parse({ company: "" });
  });
});

test("accepts approved review payload", () => {
  const result = reviewSchema.parse({
    status: "approved",
    emailBody: "Hello",
    linkedinMessage: "Hi"
  });

  assert.equal(result.status, "approved");
});
