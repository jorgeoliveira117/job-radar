import { CONFIG } from "./config.js";
import type { Job } from "./types.js";

const has = (haystack: string, needles: string[]) =>
  needles.some((n) => haystack.includes(n));

export function matches(job: Job): boolean {
  const searchable = [job.title, job.text, job.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!has(searchable, CONFIG.includeAny)) return false;
  if (has(searchable, CONFIG.excludeAny)) return false;
  return true;
}
