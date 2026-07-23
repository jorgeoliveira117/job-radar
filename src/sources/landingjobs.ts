import type { Job } from "../types.js";

interface LandingJobsJob {
  id?: number;
  url?: string;
  title?: string;
  published_at?: string;
  created_at?: string;
  remote?: boolean;
  locations?: unknown;
  tags?: unknown;
  main_requirements?: string;
  nice_to_have?: string;
  role_description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((v) => {
    if (typeof v === "string") return [v];
    if (!isRecord(v)) return [];
    const candidates = [v.name, v.city, v.country, v.label];
    return candidates.filter((x): x is string => typeof x === "string");
  });
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asJob(value: unknown): LandingJobsJob | null {
  if (!isRecord(value)) return null;
  return {
    id: typeof value.id === "number" ? value.id : undefined,
    url: typeof value.url === "string" ? value.url : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    published_at:
      typeof value.published_at === "string" ? value.published_at : undefined,
    created_at:
      typeof value.created_at === "string" ? value.created_at : undefined,
    remote: typeof value.remote === "boolean" ? value.remote : undefined,
    locations: value.locations,
    tags: value.tags,
    main_requirements:
      typeof value.main_requirements === "string"
        ? value.main_requirements
        : undefined,
    nice_to_have:
      typeof value.nice_to_have === "string" ? value.nice_to_have : undefined,
    role_description:
      typeof value.role_description === "string"
        ? value.role_description
        : undefined,
  };
}

export async function fetchLandingJobs(url: string): Promise<Job[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`landingjobs: HTTP ${res.status}`);

  const payload = (await res.json()) as unknown;
  const rawJobs = Array.isArray(payload) ? payload : [];

  return rawJobs.flatMap((raw): Job[] => {
    const j = asJob(raw);
    if (!j) return [];

    const resolvedUrl =
      j.url ??
      (typeof j.id === "number"
        ? `https://landing.jobs/jobs/${j.id}`
        : undefined);
    if (!resolvedUrl || !j.title) return [];

    const locationParts = asStringArray(j.locations);
    const location =
      locationParts.join(", ") || (j.remote ? "Remote" : undefined);

    const tags = asStringArray(j.tags);
    const text = [
      location,
      ...tags,
      j.main_requirements ? stripHtml(j.main_requirements) : "",
      j.nice_to_have ? stripHtml(j.nice_to_have) : "",
      j.role_description ? stripHtml(j.role_description) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: resolvedUrl,
        title: j.title,
        company: "Landing.jobs",
        source: "landingjobs",
        location,
        posted: j.published_at ?? j.created_at,
        text,
      },
    ];
  });
}
