# job-radar

A tiny, self-hosted job-search radar. Every weekday morning it fetches remote-job
sources, filters them against my stack and location constraints, drops anything
it has already shown me, and files the survivors as a GitHub Issue, which
GitHub emails to me.

Built because the alternatives failed in instructive ways: hosted automation
tools sit behind trials and subscriptions, and global job feeds cap at their
top ~100 entries, which for a niche search means the relevant postings scroll
past before you ever see them. The fixes are structural: **scoped feeds**
(a per-category feed's top 100 _is_ your top 100) plus direct APIs
(Greenhouse, Lever, RemoteOK) and aggregator APIs/RSS (Jobicy, Remotive,
Working Nomads, Himalayas, Landing.jobs), all running on GitHub Actions' free
scheduled workflows. No server, no trial, no scrolling.

## How it works

```
cron (weekdays 07:00 UTC)
  └─ fetch sources (RSS categories · company boards · RemoteOK API · aggregators)
       └─ keyword filter (include/exclude, location heuristics)
            └─ dedupe against data/seen.json (committed back = free versioned state)
                 └─ GitHub Issue "Radar digest — YYYY-MM-DD (N new)" → email
```

Design notes:

- **State without a database.** `data/seen.json` is committed back by the
  workflow after each run: versioned, inspectable, zero infrastructure.
- **Sources fail independently.** `Promise.allSettled` means one dead feed
  degrades the digest instead of killing it.
- **Notifications without SMTP.** Filing an Issue rides GitHub's own
  notification pipeline; no email credentials anywhere.
- **Tested where it matters.** The filter is the judgment layer, so the filter
  is what has tests.

## Setup

1. Fork/clone, `npm install`, `npm test`.
2. Tune `src/config.ts`: keywords, feeds, and source toggles/endpoints
   (use each `verifyInBrowser` flag as your reminder to re-check endpoints).
3. Dry-run locally: `npm run radar` (prints the digest when no token is set).
4. Push to GitHub, enable Actions, and trigger **Run workflow** once manually.
5. Let the cron take it from there.

## Roadmap

- Freshness cutoff (skip postings older than N days)
- Per-company keyword overrides for watchlist boards
- Weekly rollup issue with application-status checkboxes
