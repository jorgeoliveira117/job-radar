import type { Job } from "../types.js";

interface GhJob {
  absolute_url: string;
  title: string;
  location?: { name?: string };
  updated_at?: string;
}

export async function fetchGreenhouse(board: string): Promise<Job[]> {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`,
  );
  if (!res.ok) throw new Error(`greenhouse ${board}: HTTP ${res.status}`);
  const data = (await res.json()) as { jobs: GhJob[] };
  return data.jobs.map((j) => ({
    url: j.absolute_url,
    title: j.title,
    company: board,
    source: "greenhouse",
    location: j.location?.name,
    posted: j.updated_at,
    text: j.location?.name ?? "",
  }));
}
