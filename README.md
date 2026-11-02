# MatchdayXI

MATCHDAY XI is a web app (it runs in the browser and can be installed to a phone's home screen; there is a web app manifest and schema.org WebApplication data). It is a Premier League line-up maker: a tactical board with formations, 2026/27 squads for all 20 clubs, home/away/third kit colours, a bench and dugout, PNG export and a share link. Built with TanStack Start and hosted on Whop (`whop apps deploy`).

- `src/components/Board.tsx`: the board
- `src/lib/`: data, kits, pitch drawing and export, logos, credits (stub) and config
- `src/data/squads.json`: squads (name, shirt number, position), transcribed from premierleague.com
- `/brand`: logo kit (unlisted)
- `neon.ts`: Neon project config (Postgres for credit usage, not wired yet)

Run locally: `bun install` then `bun run dev`. Secrets and local links (`.env*`, `.neon`) are git-ignored.

## Plans

Free (5 watermarked images), Trial (£0.99, 5 images), Unlimited (£30 once), Creator (£18.99/month or £199.99/year) and credit packs (£2.50/8, £5/25, £8.99/50). Prices and limits live in `src/lib/config.ts` and `src/lib/credits.ts`. Only the free tier is live; paid tiers need Whop sign-in and checkout links.
