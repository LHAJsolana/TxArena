# TxArena

> Multiple agents. One shared feed. Transparent signal scoring.

TxArena is an autonomous sports market-intelligence arena for TxLINE. It compares deterministic agents analyzing the same World Cup-style odds and score feed, generating explainable signals and ranking agent performance through transparent scoring.

TxArena is an agent-evaluation and sports-data analysis product. It does not execute wagers, sell predictions, provide betting advice, or provide financial advice.

## Current Project Status

TxArena is fully working in demo mode and production-ready for judge testing.

Validation completed:

- Typecheck passed
- Production build passed
- `npm run check` passed
- Demo smoke test passed
- Demo database reseeded and ready
- TxLINE status endpoint working
- Demo Replay Mode working
- Dual-token TxLINE live integration implemented

Real TxLINE ingestion has been implemented according to the official dual-token authentication flow. The system is ready to ingest live TxLINE data once valid `TXLINE_GUEST_JWT` and `TXLINE_API_TOKEN` credentials are configured. Live ingestion has not yet been confirmed because valid credentials are not currently available. Demo Replay Mode remains available so judges can evaluate the complete product experience even if live credentials or match activity are unavailable during review.

## Why it matters

Fast-moving sports feeds are difficult to interpret consistently. TxArena gives every agent the same source data, records its reasoning and confidence, and makes strategy behavior directly comparable. Judges can inspect the complete path from feed normalization to signals, logs, and leaderboard updates.

## Product highlights

- Four deterministic strategies: Momentum, Contrarian, Volatility, and Context
- Six replayable World Cup-style match feeds
- Explainable signals with confidence, strength, reasoning, and status
- Probability-movement charts and dedicated match battle pages
- Transparent five-dimension agent scoring and leaderboard
- Searchable telemetry covering replay, normalization, signals, and scoring
- Five-second dashboard polling and a manual agent-cycle control
- Server-side TxLINE integration boundary with no credentials exposed to the browser

## Agent strategies

| Agent | Evaluation logic |
|---|---|
| Momentum | Follows movement confirmed across multiple snapshots |
| Contrarian | Detects sharp short-window repricing and possible overreaction |
| Volatility | Measures combined market displacement and instability |
| Context | Combines match time, score state, and draw pressure |

## Transparent scoring

`arena score = accuracy × 35% + calibration × 20% + reaction speed × 15% + consistency × 15% + volatility awareness × 15%`

Every dimension is bounded from 0 to 100. Demo evaluation is deterministic and isolated in `lib/scoring` so judges can reproduce and inspect agent behavior.

## Demo Replay Mode

No TxLINE credentials are required to judge the complete product. Demo Replay Mode uses seeded TxLINE-style match and odds snapshots, then advances them through the same normalization, agent, persistence, logging, and scoring pipeline used by the application.

Select **Run Agent Cycle** from the arena, match, or logs page to:

1. Advance all active replay feeds.
2. Normalize new odds snapshots into implied probabilities.
3. Run all four deterministic agents against the same data.
4. Store generated signals and explainable reasoning.
5. Update system logs and the transparent leaderboard.

The replay is deterministic enough for a reliable judge demo while still producing visible market-movement and agent-evaluation changes.

## Judging Flow

1. Open the homepage and review the product positioning.
2. Select **Enter Arena** to view all replay feeds and agents.
3. Open a match battle page to compare strategies on identical data.
4. Select **Run Agent Cycle** to advance the replay and execute the agents.
5. Inspect the signal timeline, confidence, reasoning, and activity feed.
6. Open **Leaderboard** to review transparent scoring dimensions.
7. Open **Logs** to verify ingestion, normalization, agent decisions, and scoring updates.

This flow takes approximately three to five minutes.

## TxLINE Integration

TxArena has a server-only TxLINE adapter and live-ingestion proof path. `TXLINE_BASE_URL` selects the TxLINE origin; mainnet uses `https://txline.txodds.com`. Authentication requires two distinct credentials, and neither is exposed to browser code:

- `TXLINE_GUEST_JWT` is the guest-session JWT returned by `POST /auth/guest/start`. It establishes a session but does not grant data access by itself.
- `TXLINE_API_TOKEN` is the activated, long-lived API token returned after subscription activation through `POST /api/token/activate`. `TXLINE_API_KEY` remains supported only as a backward-compatible alias for this value.

Every data request sends both `Authorization: Bearer <TXLINE_GUEST_JWT>` and `X-Api-Token: <TXLINE_API_TOKEN>`. The adapter exposes a server-only guest-session helper, but it never treats a new guest JWT as proof of an active subscription.

Free World Cup access still requires completing the on-chain subscription and token-activation flow. TxLINE documents free service level 1 and service level 12 options, depending on the selected network and current availability; developers should confirm the applicable tier during activation.

The implementation uses the endpoints published in the official TxLINE snapshot guide:

- `GET /api/fixtures/snapshot`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/scores/snapshot/{fixtureId}`

`POST /api/txline/sync` fetches World Cup fixtures, reads their latest 1X2 odds and score snapshots, normalizes probabilities, and upserts matches and new odds snapshots into the existing database. `GET /api/txline/status` safely reports configuration, connection state, the last attempt, and the endpoint used without exposing secrets. The arena includes the same status and manual-sync proof in the UI.

Run in demo mode with `NEXT_PUBLIC_APP_MODE=demo`; no TxLINE tokens are required and **Run Agent Cycle** advances seeded replay data. Run in live mode with `NEXT_PUBLIC_APP_MODE=live`, `TXLINE_GUEST_JWT`, an activated `TXLINE_API_TOKEN`, and a valid `TXLINE_BASE_URL`; sync the feed before running agents. Live cycles analyze the latest stored TxLINE snapshots and never mutate them as replay data.

Judges can verify the complete path with:

1. `GET /api/txline/status` — confirm dual-token configuration and prior connection state.
2. `POST /api/txline/sync` — fetch, normalize, and persist the current TxLINE snapshot.
3. `POST /api/agent/run` — execute deterministic agents against the latest stored TxLINE data in live mode.

The same sync control is available in the arena UI. Demo Replay Mode remains available so the complete agent-evaluation flow can be tested when tokens are unavailable.

The adapter implements the documented snapshot schemas, but provider market labels can vary. The isolated 1X2 mapping in `lib/txline/ingestion.ts` is the explicit place to extend mapping if the activated feed returns additional market naming conventions.

## Architecture

`TxLINE Adapter / Demo Replay → Normalization → Agent Engine → Signal Storage → Scoring Engine → Arena / Leaderboard / Logs`

Tech stack: Next.js App Router, React, strict TypeScript, Tailwind CSS, Recharts, Prisma ORM, SQLite, and Lucide icons.

## How to Run Locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
```

Copy `.env.example` to `.env`, then initialize and seed the demo database:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seed command resets demo data, so do not run it against data you need to preserve.

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma database URL; local default is `file:./dev.db` |
| `NEXT_PUBLIC_APP_MODE` | `demo` or `live` presentation mode |
| `TXLINE_BASE_URL` | Absolute provider origin; mainnet is `https://txline.txodds.com` |
| `TXLINE_GUEST_JWT` | Guest JWT returned by `POST /auth/guest/start` |
| `TXLINE_API_TOKEN` | Activated API token returned after subscription activation |
| `TXLINE_API_KEY` | Deprecated compatibility alias for `TXLINE_API_TOKEN` |
| `AGENT_CYCLE_TOKEN` | Optional bearer token protecting `POST /api/agent/run` |

## API Surface

- `GET /api/health`
- `GET /api/matches` and `GET /api/matches/:matchId`
- `GET /api/signals`, `GET /api/leaderboard`, and `GET /api/logs`
- `GET /api/txline/status`
- `POST /api/txline/sync`
- `POST /api/agent/run`

## How to Deploy

1. Provision a persistent filesystem for the SQLite demo database, or migrate to managed PostgreSQL for serverless or multi-instance hosting.
2. Configure the environment variables listed above. Keep all TxLINE credentials server-side.
3. Run `npm ci`, `npm run db:push`, and `npm run db:seed` for a new demo deployment.
4. Run `npm run check` and `npm run smoke`, then reseed if a pristine demo state is required.
5. Build with `npm run build` and start with `npm start`.
6. Verify `/api/health`, `/api/txline/status`, the arena, agent cycle, leaderboard, and logs before publishing.

## Production Notes

- SQLite is suitable for a one-node demo deployment with a persistent filesystem and backups.
- PostgreSQL is recommended before deploying to Vercel, another serverless platform, or multiple application instances.
- `AGENT_CYCLE_TOKEN` can protect the cycle endpoint for an admin-only deployment. When enabled, calls must include `Authorization: Bearer <token>`; the public dashboard button should sit behind an authenticated proxy or remain disabled.
- Run `npm ci`, `npx prisma generate`, `npm run db:push`, and `npm run check` in CI.
- Seed only a new demo database because `npm run db:seed` intentionally resets arena data.
- Start the built application with `npm start` and monitor `GET /api/health`.
- Terminate HTTPS at the hosting platform or reverse proxy and keep all secrets server-side.

## Verification

```bash
npm run typecheck
npm run build
npm run check
npm run smoke
```

The smoke script advances demo data. Reseed afterward when a pristine judging state is required.

## Compliance

TxArena is an autonomous sports-market intelligence and agent-evaluation tool. It provides explainable sports-data analysis and odds-movement monitoring. It does not execute bets, provide betting advice, automate gambling, guarantee outcomes, sell predictions, or provide financial advice.

## Submission Checklist

- [x] Working Demo Replay Mode without external credentials
- [x] Four inspectable deterministic agents
- [x] Explainable signals, scoring, leaderboard, and logs
- [x] TxLINE live integration boundary documented
- [x] Compliance-safe product language
- [x] Health endpoint and production security headers
- [x] Local setup and judging flow documented
- [ ] Add final public repository URL
- [ ] Add final deployment URL
- [ ] Add final demo video URL

## Submission Notes

- Demo video: `[ADD DEMO VIDEO URL]`
- Deployed application: `[ADD DEPLOYED APP URL]`
- Public GitHub repository: `[ADD PUBLIC REPOSITORY URL]`
- TxLINE endpoints used: `fixtures/snapshot`, `odds/snapshot/{fixtureId}`, `scores/snapshot/{fixtureId}`
- TxLINE API feedback: `[ADD FEEDBACK AFTER LIVE CREDENTIAL TESTING]`
