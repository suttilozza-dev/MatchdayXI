# MatchdayXI

MATCHDAY XI is a web app (it runs in the browser and can be installed to a phone's home screen; there is a web app manifest and schema.org WebApplication data). It is a Premier League line-up maker: a tactical board with formations, 2026/27 squads for all 20 clubs, home/away/third kit colours, a bench and dugout, PNG export and one-click sharing to X, Facebook, Reddit and Instagram. Built with TanStack Start and hosted on Whop (`whop apps deploy`).

- `src/components/Board.tsx`: the board
- `src/lib/`: data, kits, pitch drawing and export, logos, credits (stub) and config
- `src/data/squads.json`: squads (name, shirt number, position), transcribed from premierleague.com
- `/brand`: logo kit (unlisted)
- `neon.ts`: Neon project config (Postgres for credit usage, not wired yet)

Run locally: `bun install` then `bun run dev`. Secrets and local links (`.env*`, `.neon`) are git-ignored.

## Plans

Free (the first image needs no sign-up, tracked in the browser only; sign in with Whop for 3 watermarked images every week), Gameweek Pass (£2.99, 7 days), Plus (£4.99 a month or £29.99 a year), Creator (£9.99 a month or £79.99 a year, rising as features ship), and Founder Lifetime (£79.99, first 500 buyers). The old trial, credit packs and £30 Unlimited are retired from the site but their plan ids still grant access. Prices and limits live in `src/lib/config.ts` and `src/lib/credits.ts`. The board also has a captain's armband, a manager name, marker styles (circle, shirt front, shirt back), name position, a phone Share image button and square / 4:5 / 9:16 / 16:9 / 4:1 image sizes. Paid tiers work like this: the buyer signs in with Whop (`/api/auth/login`), pays through a Whop checkout link, Whop calls `/api/webhooks/whop` on `payment.succeeded`, and the app records the grant in Neon Postgres (`grants` table, created on first use). `/api/access` reports what the signed-in buyer owns and `/api/spend` counts an export against it. Variant to plan mapping lives in `src/lib/server/plans.ts`.

### Secrets and setup (not in git)

Set with `whop apps secrets set --secret KEY=VALUE`: `DATABASE_URL` (Neon Postgres), `SESSION_SECRET` (long random string), `WHOP_WEBHOOK_SECRET` (the `ws_...` secret from the Whop webhook). In Whop: register `https://matchday-xi.club/api/auth/callback` as an OAuth redirect URI for the app, and create a webhook to `https://matchday-xi.club/api/webhooks/whop` for `payment.succeeded` and `refund.created`.
