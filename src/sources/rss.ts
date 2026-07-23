import Parser from "rss-parser";
import type { Job } from "../types.js";

const parser = new Parser();

/** WWR packs "Company: Job Title" into item titles; split defensively. */
function splitTitle(raw: string): { company: string; title: string } {
  const parts = raw.split(": ");
  if (parts.length < 2) return { company: "", title: raw };
  return { company: parts[0], title: parts.slice(1).join(": ") };
}

export async function fetchRss(feedUrl: string): Promise<Job[]> {
  const feed = await parser.parseURL(feedUrl);
  const source = new URL(feedUrl).hostname;
  return (feed.items ?? []).flatMap((item) => {
    if (!item.link || !item.title) return [];
    const { company, title } = splitTitle(item.title);
    return [{
      url: item.link,
      title,
      company,
      source,
      posted: item.isoDate ?? item.pubDate,
      text: [item.contentSnippet, (item.categories ?? []).join(" ")]
        .filter(Boolean)
        .join(" "),
    }];
  });
}
