export interface Job {
  /** Canonical URL, used as the dedupe key. */
  url: string;
  title: string;
  company: string;
  source: string;
  location?: string;
  posted?: string;
  /** Extra text (description snippet, tags) used for keyword matching. */
  text?: string;
}
