import type { Job } from "../types.js";

interface LeverPosting {
  hostedUrl: string;
  text: string;
  categories?: { location?: string; team?: string; commitment?: string };
  createdAt?: number;
}

export async function fetchLever(company: string): Promise<Job[]> {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${company}?mode=json`,
  );
  if (!res.ok) throw new Error(`lever ${company}: HTTP ${res.status}`);
  const data = (await res.json()) as LeverPosting[];
  return data.map((p) => ({
    url: p.hostedUrl,
    title: p.text,
    company,
    source: "lever",
    location: p.categories?.location,
    posted: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    text: [p.categories?.location, p.categories?.team, p.categories?.commitment]
      .filter(Boolean)
      .join(" "),
  }));
}
