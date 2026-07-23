import type { Job } from "../types.js";

interface RemoteOkPosting {
  url?: string;
  position?: string;
  company?: string;
  location?: string;
  date?: string;
  tags?: string[];
  description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asPosting(value: unknown): RemoteOkPosting | null {
  if (!isRecord(value)) return null;
  return {
    url: typeof value.url === "string" ? value.url : undefined,
    position: typeof value.position === "string" ? value.position : undefined,
    company: typeof value.company === "string" ? value.company : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
    date: typeof value.date === "string" ? value.date : undefined,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((t): t is string => typeof t === "string")
      : undefined,
    description:
      typeof value.description === "string" ? value.description : undefined,
  };
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchRemoteOk(): Promise<Job[]> {
  const res = await fetch("https://remoteok.com/api");
  if (!res.ok) throw new Error(`remoteok api: HTTP ${res.status}`);

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new Error("remoteok api: unexpected payload");
  }

  return json.flatMap((entry): Job[] => {
    const posting = asPosting(entry);
    if (!posting?.url || !posting.position) return [];

    const text = [
      posting.location,
      (posting.tags ?? []).join(" "),
      posting.description ? stripHtml(posting.description) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: posting.url,
        title: posting.position,
        company: posting.company ?? "RemoteOK",
        source: "remoteok",
        location: posting.location,
        posted: posting.date,
        text,
      },
    ];
  });
}
