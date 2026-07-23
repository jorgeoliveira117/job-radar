import type { Job } from "./types.js";

export function buildDigest(jobs: Job[]): string {
  const bySource = new Map<string, Job[]>();
  for (const job of jobs) {
    bySource.set(job.source, [...(bySource.get(job.source) ?? []), job]);
  }
  const sections = [...bySource.entries()].map(([source, list]) => {
    const lines = list.map(
      (j) =>
        `- [${j.title}](${j.url}) — ${j.company}${j.location ? ` · ${j.location}` : ""}`,
    );
    return `### ${source} (${list.length})\n\n${lines.join("\n")}`;
  });
  return sections.join("\n\n");
}
