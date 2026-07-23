import Parser from "rss-parser";
import type { Job } from "../types.js";

const parser = new Parser();

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readNamespaced(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const values = value.filter((v): v is string => typeof v === "string");
    if (values.length > 0) return values.join(", ");
  }
  return "";
}

export async function fetchHimalayasRss(feedUrl: string): Promise<Job[]> {
  const feed = await parser.parseURL(feedUrl);
  return (feed.items ?? []).flatMap((item): Job[] => {
    if (!item.link || !item.title) return [];

    const row = item as unknown as Record<string, unknown>;
    const company =
      readNamespaced(row, "himalayasJobs:companyName") || "Himalayas";
    const location = readNamespaced(row, "himalayasJobs:locationRestriction");

    const text = [
      location,
      ...(item.categories ?? []).filter(
        (c): c is string => typeof c === "string",
      ),
      asString(item.contentSnippet),
      asString(item.content),
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        url: item.link,
        title: item.title,
        company,
        source: "himalayas",
        location: location || undefined,
        posted: item.isoDate ?? item.pubDate,
        text,
      },
    ];
  });
}
