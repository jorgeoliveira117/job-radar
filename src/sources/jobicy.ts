import type { Job } from "../types.js";

interface JobicyPayload {
  jobs?: unknown;
}

interface JobicyJob {
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobGeo?: string;
  pubDate?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobLevel?: string[];
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

function asJob(value: unknown): JobicyJob | null {
  if (!isRecord(value)) return null;
  return {
    url: typeof value.url === "string" ? value.url : undefined,
    jobTitle: typeof value.jobTitle === "string" ? value.jobTitle : undefined,
    companyName:
      typeof value.companyName === "string" ? value.companyName : undefined,
    jobGeo: typeof value.jobGeo === "string" ? value.jobGeo : undefined,
    pubDate: typeof value.pubDate === "string" ? value.pubDate : undefined,
    jobExcerpt:
      typeof value.jobExcerpt === "string" ? value.jobExcerpt : undefined,
    jobDescription:
      typeof value.jobDescription === "string"
        ? value.jobDescription
        : undefined,
    jobIndustry: asStringArray(value.jobIndustry),
    jobType: asStringArray(value.jobType),
    jobLevel: asStringArray(value.jobLevel),
  };
}

export async function fetchJobicy(url: string): Promise<Job[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`jobicy: HTTP ${res.status}`);

  const payload = (await res.json()) as JobicyPayload;
  const rawJobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return rawJobs.flatMap((raw): Job[] => {
    const j = asJob(raw);
    if (!j?.url || !j.jobTitle) return [];

    const text = [
      j.jobGeo,
      ...(j.jobIndustry ?? []),
      ...(j.jobType ?? []),
      ...(j.jobLevel ?? []),
      j.jobExcerpt,
      j.jobDescription ? stripHtml(j.jobDescription) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: j.url,
        title: j.jobTitle,
        company: j.companyName ?? "Jobicy",
        source: "jobicy",
        location: j.jobGeo,
        posted: j.pubDate,
        text,
      },
    ];
  });
}
