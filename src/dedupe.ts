import { readFileSync, writeFileSync } from "node:fs";
import { CONFIG } from "./config.js";
import type { Job } from "./types.js";

const SEEN_PATH = "data/seen.json";
type Seen = Record<string, string>; // url -> ISO date first seen

export function loadSeen(): Seen {
  try {
    return JSON.parse(readFileSync(SEEN_PATH, "utf8")) as Seen;
  } catch {
    return {};
  }
}

export function unseenOnly(jobs: Job[], seen: Seen): Job[] {
  return jobs.filter((j) => !(j.url in seen));
}

export function saveSeen(seen: Seen, newJobs: Job[]): void {
  const now = new Date();
  const cutoff = now.getTime() - CONFIG.seenTtlDays * 24 * 60 * 60 * 1000;
  for (const job of newJobs) seen[job.url] = now.toISOString();
  const pruned = Object.fromEntries(
    Object.entries(seen).filter(([, date]) => new Date(date).getTime() > cutoff),
  );
  writeFileSync(SEEN_PATH, JSON.stringify(pruned, null, 2) + "\n");
}
