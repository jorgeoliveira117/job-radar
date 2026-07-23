import type { Job } from "../types.js";

interface RemotivePayload {
  jobs?: unknown;
}

interface RemotiveJob {
  url?: string;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  publication_date?: string;
  description?: string;
  category?: string;
  job_type?: string;
  salary?: string;
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

function asJob(value: unknown): RemotiveJob | null {
  if (!isRecord(value)) return null;
  return {
    url: typeof value.url === "string" ? value.url : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    company_name:
      typeof value.company_name === "string" ? value.company_name : undefined,
    candidate_required_location:
      typeof value.candidate_required_location === "string"
        ? value.candidate_required_location
        : undefined,
    publication_date:
      typeof value.publication_date === "string"
        ? value.publication_date
        : undefined,
    description:
      typeof value.description === "string" ? value.description : undefined,
    category: typeof value.category === "string" ? value.category : undefined,
    job_type: typeof value.job_type === "string" ? value.job_type : undefined,
    salary: typeof value.salary === "string" ? value.salary : undefined,
    tags: asStringArray(value.tags),
  };
}

export async function fetchRemotive(url: string): Promise<Job[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`remotive: HTTP ${res.status}`);

  const payload = (await res.json()) as RemotivePayload;
  const rawJobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return rawJobs.flatMap((raw): Job[] => {
    const j = asJob(raw);
    if (!j?.url || !j.title) return [];

    const text = [
      j.candidate_required_location,
      j.category,
      j.job_type,
      j.salary,
      ...(j.tags ?? []),
      j.description ? stripHtml(j.description) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: j.url,
        title: j.title,
        company: j.company_name ?? "Remotive",
        source: "remotive",
        location: j.candidate_required_location,
        posted: j.publication_date,
        text,
      },
    ];
  });
}
