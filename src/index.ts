import { CONFIG } from "./config.js";
import { fetchRss } from "./sources/rss.js";
import { fetchGreenhouse } from "./sources/greenhouse.js";
import { fetchLever } from "./sources/lever.js";
import { fetchRemoteOk } from "./sources/remoteok.js";
import { fetchJobicy } from "./sources/jobicy.js";
import { fetchRemotive } from "./sources/remotive.js";
import { fetchWorkingNomads } from "./sources/workingnomads.js";
import { fetchHimalayasRss } from "./sources/himalayas.js";
import { fetchLandingJobs } from "./sources/landingjobs.js";
import { matches } from "./filter.js";
import { loadSeen, saveSeen, unseenOnly } from "./dedupe.js";
import { buildDigest } from "./digest.js";
import type { Job } from "./types.js";

async function createIssue(title: string, body: string): Promise<void> {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    console.log("No GITHUB_TOKEN/REPOSITORY; printing digest instead:\n");
    console.log(body);
    return;
  }
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, labels: ["digest"] }),
  });
  if (!res.ok) throw new Error(`issue creation failed: HTTP ${res.status}`);
}

async function main(): Promise<void> {
  if (
    CONFIG.aggregators.jobicy.enabled &&
    CONFIG.aggregators.jobicy.verifyInBrowser
  ) {
    console.warn("jobicy endpoint enabled; verify in browser periodically");
  }
  if (
    CONFIG.aggregators.remotive.enabled &&
    CONFIG.aggregators.remotive.verifyInBrowser
  ) {
    console.warn("remotive endpoint enabled; verify in browser periodically");
  }
  if (
    CONFIG.aggregators.workingNomads.enabled &&
    CONFIG.aggregators.workingNomads.verifyInBrowser
  ) {
    console.warn(
      "workingnomads endpoint enabled; verify in browser periodically",
    );
  }
  if (
    CONFIG.aggregators.himalayas.enabled &&
    CONFIG.aggregators.himalayas.verifyInBrowser
  ) {
    console.warn("himalayas endpoint enabled; verify in browser periodically");
  }
  if (
    CONFIG.aggregators.landingJobs.enabled &&
    CONFIG.aggregators.landingJobs.verifyInBrowser
  ) {
    console.warn(
      "landingjobs endpoint enabled; verify in browser periodically",
    );
  }

  const tasks: Promise<Job[]>[] = [
    ...CONFIG.rssFeeds.map(fetchRss),
    ...CONFIG.greenhouseBoards.map(fetchGreenhouse),
    ...CONFIG.leverCompanies.map(fetchLever),
    fetchRemoteOk(),
    ...(CONFIG.aggregators.jobicy.enabled
      ? [fetchJobicy(CONFIG.aggregators.jobicy.url)]
      : []),
    ...(CONFIG.aggregators.remotive.enabled
      ? [fetchRemotive(CONFIG.aggregators.remotive.url)]
      : []),
    ...(CONFIG.aggregators.workingNomads.enabled
      ? [fetchWorkingNomads(CONFIG.aggregators.workingNomads.url)]
      : []),
    ...(CONFIG.aggregators.himalayas.enabled
      ? [fetchHimalayasRss(CONFIG.aggregators.himalayas.rssUrl)]
      : []),
    ...(CONFIG.aggregators.landingJobs.enabled
      ? [fetchLandingJobs(CONFIG.aggregators.landingJobs.url)]
      : []),
  ];
  const settled = await Promise.allSettled(tasks);

  const jobs: Job[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") jobs.push(...result.value);
    else console.warn("source failed:", result.reason);
  }

  const relevant = jobs.filter(matches);
  const seen = loadSeen();
  const fresh = unseenOnly(relevant, seen);

  console.log(
    `fetched ${jobs.length}, relevant ${relevant.length}, new ${fresh.length}`,
  );

  if (fresh.length > 0) {
    const date = new Date().toISOString().slice(0, 10);
    await createIssue(
      `Radar digest — ${date} (${fresh.length} new)`,
      buildDigest(fresh),
    );
  }
  saveSeen(seen, fresh);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
