# TxArena Submission Text

## Superteam Earn Project Description

TxArena is an autonomous sports market-intelligence arena for TxLINE. It compares deterministic agents analyzing the same World Cup-style odds and score feed, generating explainable signals and ranking agent performance through transparent scoring.

Four strategies—Momentum, Contrarian, Volatility, and Context—receive identical normalized data. Their confidence, reasoning, signals, activity, and evaluation scores are visible through an arena dashboard, match battle views, a transparent leaderboard, and system telemetry.

## Technical Documentation

TxArena uses Next.js, React, strict TypeScript, Prisma, SQLite, Tailwind CSS, and Recharts. Server-side ingestion normalizes match scores and 1X2 odds into typed internal snapshots. Deterministic agents analyze stored snapshot history and produce explainable candidates. Signals, logs, match state, and five scoring dimensions are persisted through Prisma.

Demo Replay Mode provides six seeded World Cup-style feeds and advances them through the same normalization, agent, storage, logging, and scoring pipeline. This gives judges a reliable end-to-end experience even when provider credentials or live match activity are unavailable.

## TxLINE Integration

The project includes a working demo replay system and a real TxLINE live-ingestion layer. TxArena implements the official dual-token authentication flow using a guest JWT plus an activated API token, keeps all credentials server-side, normalizes fixtures, odds, and scores into internal match snapshots, and runs agent cycles against the latest stored data.

Each live data request sends both:

- `Authorization: Bearer <TXLINE_GUEST_JWT>`
- `X-Api-Token: <TXLINE_API_TOKEN>`

The public status endpoint exposes only safe configuration booleans, connection state, last fetch time, and endpoint metadata. It never returns either credential.

## TxLINE Endpoints Used

- Guest session: `POST /auth/guest/start`
- Subscription activation: `POST /api/token/activate`
- Fixtures: `GET /api/fixtures/snapshot`
- Odds: `GET /api/odds/snapshot/{fixtureId}`
- Scores: `GET /api/scores/snapshot/{fixtureId}`
- Additional endpoint notes: `[ADD NOTES AFTER CREDENTIALLED TESTING]`

## Feedback on the TxLINE API

`[ADD FINAL FEEDBACK AFTER LIVE CREDENTIAL TESTING: authentication onboarding, schema clarity, market labels, response latency, and developer experience]`

The snapshot separation between fixtures, odds, and scores provides a clean ingestion boundary. Concrete production feedback should be added only after a credentialled live test.

## Live-Credential Caveat

The live adapter, dual-token headers, normalization, persistence, status reporting, and live agent-cycle path are implemented. Real TxLINE ingestion has not been confirmed because valid `TXLINE_GUEST_JWT` and `TXLINE_API_TOKEN` credentials are not currently configured. The submission must not describe live ingestion as successfully tested until that test occurs.

## Compliance

TxArena does not execute bets or provide betting advice. It is focused on autonomous agent evaluation, sports-market intelligence, explainability, and real-time odds movement analysis.

## Submission Links

- Demo video: `[ADD DEMO VIDEO LINK]`
- Deployed application: `[ADD DEPLOYED APP LINK]`
- Public GitHub repository: `[ADD PUBLIC GITHUB LINK]`
