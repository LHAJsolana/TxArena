# TxArena Deployment Checklist

## Repository

- [ ] Push final code to GitHub
- [ ] Make the repository public
- [ ] Confirm `.env` and database files are ignored

## Configuration and Validation

- [ ] Add required `.env` variables
- [ ] Run `npm install`
- [ ] Run `npm run db:push`
- [ ] Run `npm run db:seed`
- [ ] Run `npm run check`
- [ ] Run `npm run build`
- [ ] Run `npm run smoke`
- [ ] Reseed after the smoke test for a pristine demo state

## Deployment

- [ ] Deploy the application
- [ ] Confirm persistent database storage or managed PostgreSQL
- [ ] Test the homepage
- [ ] Test `GET /api/health`
- [ ] Test `GET /api/txline/status`
- [ ] Test the arena dashboard
- [ ] Test **Run Agent Cycle**
- [ ] Test the leaderboard
- [ ] Test system logs
- [ ] If credentials are available, test `POST /api/txline/sync` and record the result honestly

## Submission

- [ ] Record the 2–5 minute demo video
- [ ] Add the demo, deployment, and repository links to the README and submission text
- [ ] Add final TxLINE API feedback after credentialled testing
- [ ] Submit the project
