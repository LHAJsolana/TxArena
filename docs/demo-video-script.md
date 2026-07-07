# TxArena Demo Video Script

Target length: 2–5 minutes.

## 0:00–0:25 — Homepage

Open the homepage.

“TxArena is an autonomous sports market-intelligence arena for TxLINE. Multiple deterministic strategy agents analyze the same World Cup-style odds and score feed, generate explainable signals, and receive transparent evaluation scores.”

Point out the market-intelligence positioning and the compliance notice.

## 0:25–0:55 — Arena Dashboard

Select **Enter Arena**. Show the active matches, signal count, four agents, market alerts, and leaderboard preview.

Explain that every agent receives the same normalized input, making strategy comparison fair and reproducible.

## 0:55–1:20 — TxLINE Feed Status

Show the **TxLINE Feed Status** panel. Highlight mode, configuration state, last synchronization, endpoint, and manual **Sync TxLINE Feed** control.

“TxArena implements TxLINE’s official dual-token authentication flow. Live data requests are made server-side using both a guest JWT and an activated API token. The app never exposes credentials to the client. When live credentials are unavailable, Demo Replay Mode keeps the full product testable for judges.”

Be explicit that live ingestion is implemented but has not been confirmed without valid credentials.

## 1:20–1:45 — Demo Replay and Agent Cycle

Explain that Demo Replay Mode advances seeded TxLINE-style match and odds snapshots through the same normalization, agent, persistence, logging, and scoring pipeline.

Select **Run Agent Cycle** and show the signal count or dashboard state update.

## 1:45–2:30 — Match Battle

Open one match battle page.

Show:

- Identical normalized feed for all agents
- Probability movement chart
- Momentum, Contrarian, Volatility, and Context agent cards
- Confidence and explainable reasoning
- Agent signal timeline
- Agent activity feed

Explain how the probability chart makes odds movement visible and how deterministic rules produce inspectable signals.

## 2:30–3:05 — Leaderboard

Open **Leaderboard**. Explain the weighted score:

- Signal accuracy: 35%
- Confidence calibration: 20%
- Reaction speed: 15%
- Consistency: 15%
- Volatility awareness: 15%

Emphasize that the leaderboard evaluates agent behavior rather than selling predictions.

## 3:05–3:35 — System Logs

Open **Logs**. Show replay ingestion, probability normalization, agent decisions, and scoring updates. Demonstrate the match, agent, and event-type filters.

## 3:35–4:15 — TxLINE Backend

Explain that the server adapter uses:

- `GET /api/fixtures/snapshot`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/scores/snapshot/{fixtureId}`

The adapter normalizes provider payloads into internal match and odds snapshots. In live mode, agent cycles operate on the latest stored TxLINE data. In demo mode, the replay provider keeps the same product flow available.

## 4:15–4:30 — Compliance Closing

“TxArena does not execute bets and does not provide betting advice. It is focused on autonomous sports-market intelligence, explainable agent evaluation, and real-time odds movement analysis.”
