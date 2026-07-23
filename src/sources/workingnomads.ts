import type { Job } from "../types.js";

interface WorkingNomadsJob {
  url?: string;
  title?: string;
  company_name?: string;
  location?: string;
  pub_date?: string;
  description?: string;
  category_name?: string;
  tags?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asJob(value: unknown): WorkingNomadsJob | null {
  if (!isRecord(value)) return null;
  return {
    url: typeof value.url === "string" ? value.url : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    company_name:
      typeof value.company_name === "string" ? value.company_name : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
    pub_date: typeof value.pub_date === "string" ? value.pub_date : undefined,
    description:
      typeof value.description === "string" ? value.description : undefined,
    category_name:
      typeof value.category_name === "string" ? value.category_name : undefined,
    tags: asStringArray(value.tags),
  };
}

export async function fetchWorkingNomads(url: string): Promise<Job[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`workingnomads: HTTP ${res.status}`);

  const payload = (await res.json()) as unknown;
  const rawJobs = Array.isArray(payload) ? payload : [];

  return rawJobs.flatMap((raw): Job[] => {
    const j = asJob(raw);
    if (!j?.url || !j.title) return [];

    const text = [
      j.location,
      j.category_name,
      ...(j.tags ?? []),
      j.description ? stripHtml(j.description) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: j.url,
        title: j.title,
        company: j.company_name ?? "Working Nomads",
        source: "workingnomads",
        location: j.location,
        posted: j.pub_date,
        text,
      },
    ];
  });
}
