# MatchdayXI

MATCHDAY XI is a web app (it runs in the browser and can be installed to a phone's home screen; there is a web app manifest and schema.org WebApplication data). It is a Premier League line-up maker: a tactical board with formations, 2026/27 squads for all 20 clubs, home/away/third kit colours, a bench and dugout, PNG export and a share link. Built with TanStack Start and hosted on Whop (`whop apps deploy`).

- `src/components/Board.tsx`: the board
- `src/lib/`: data, kits, pitch drawing and export, logos, credits (stub) and config
- `src/data/squads.json`: squads (name, shirt number, position), transcribed from premierleague.com
- `/brand`: logo kit (unlisted)
- `neon.ts`: Neon project config (Postgres for credit usage, not wired yet)

Run locally: `bun install` then `bun run dev`. Secrets and local links (`.env*`, `.neon`) are git-ignored.

## Plans

Free (5 watermarked images), Trial (£0.99, 5 images), Unlimited (£30 once), Creator (£18.99/month or £199.99/year) and credit packs (£2.50/8, £5/25, £8.99/50). Prices and limits live in `src/lib/config.ts` and `src/lib/credits.ts`. Paid tiers work like this: the buyer signs in with Whop (`/api/auth/login`), pays through a Whop checkout link, Whop calls `/api/webhooks/whop` on `payment.succeeded`, and the app records the grant in Neon Postgres (`grants` table, created on first use). `/api/access` reports what the signed-in buyer owns and `/api/spend` counts an export against it. Variant to plan mapping lives in `src/lib/server/plans.ts`.

### Secrets and setup (not in git)

Set with `whop apps secrets set --secret KEY=VALUE`: `DATABASE_URL` (Neon Postgres), `SESSION_SECRET` (long random string), `WHOP_WEBHOOK_SECRET` (the `ws_...` secret from the Whop webhook). In Whop: register `https://matchday-xi.club/api/auth/callback` as an OAuth redirect URI for the app, and create a webhook to `https://matchday-xi.club/api/webhooks/whop` for `payment.succeeded` and `refund.created`.
