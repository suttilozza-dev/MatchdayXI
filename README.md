# MatchdayXI

Premier League line-up maker: a tactical board with formations, 2026/27 squads for all 20 clubs, home/away/third kit colours, a bench and dugout, PNG export and a share link. Built with TanStack Start and hosted on Whop (`whop apps deploy`).

- `src/components/Board.tsx`: the board
- `src/lib/`: data, kits, pitch drawing and export, logos, credits (stub) and config
- `src/data/squads.json`: squads (name, shirt number, position), transcribed from premierleague.com
- `/brand`: logo kit (unlisted)
- `neon.ts`: Neon project config (Postgres for credit usage, not wired yet)

Run locally: `bun install` then `bun run dev`. Secrets and local links (`.env*`, `.neon`) are git-ignored.
