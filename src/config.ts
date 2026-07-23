export const CONFIG = {
  /** A job matches if title+text contains ANY of these (case-insensitive). */
  includeAny: [
    "react",
    "typescript",
    "frontend",
    "front-end",
    "front end",
    "next.js",
    "nextjs",
    "fullstack",
    "full stack",
    "full-stack",
  ],
  /** A job is dropped if title+location+text contains ANY of these. */
  excludeAny: [
    "us only",
    "usa only",
    "united states only",
    "us-based",
    "canada only",
    "onsite",
    "on-site",
    "hybrid",
  ],
  /**
   * Generic RSS feeds. Scoped category/tag feeds beat global ones:
   * their top-N *is* your top-N.
   */
  rssFeeds: [
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
  ],
  /** RemoteOK is fetched from its JSON API in src/sources/remoteok.ts. */
  /** Watchlist: Greenhouse public board API (no cap, structured). */
  greenhouseBoards: [],
  /** Watchlist: Lever public postings API. */
  leverCompanies: [],
  /** Aggregator tier (API/RSS): toggle and verify endpoints periodically. */
  aggregators: {
    jobicy: {
      enabled: true,
      verifyInBrowser: true,
      url: "https://jobicy.com/api/v2/remote-jobs?count=50&tag=react",
    },
    remotive: {
      enabled: true,
      verifyInBrowser: true,
      url: "https://remotive.com/api/remote-jobs?category=software-dev",
    },
    workingNomads: {
      enabled: true,
      verifyInBrowser: true,
      url: "https://workingnomads.com/api/exposed_jobs/",
    },
    himalayas: {
      enabled: true,
      verifyInBrowser: true,
      rssUrl: "https://himalayas.app/jobs/rss",
    },
    landingJobs: {
      enabled: true,
      verifyInBrowser: true,
      url: "https://landing.jobs/api/v1/jobs",
    },
  },
  /** Forget seen entries after this many days (keeps seen.json small). */
  seenTtlDays: 365,
};
