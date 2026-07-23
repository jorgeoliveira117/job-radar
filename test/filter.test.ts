import { describe, expect, it } from "vitest";
import { matches } from "../src/filter.js";
import type { Job } from "../src/types.js";

const job = (over: Partial<Job>): Job => ({
  url: "https://example.com/j/1",
  title: "Engineer",
  company: "Acme",
  source: "test",
  ...over,
});

describe("matches", () => {
  it("accepts a React frontend role", () => {
    expect(matches(job({ title: "Senior Frontend Engineer (React)" }))).toBe(true);
  });
  it("rejects roles with no relevant keywords", () => {
    expect(matches(job({ title: "Senior Rust Kernel Engineer" }))).toBe(false);
  });
  it("rejects US-only remote roles", () => {
    expect(
      matches(job({ title: "React Developer", text: "Remote, US only" })),
    ).toBe(false);
  });
});
