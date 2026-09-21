# Prox launch freeze

Frozen at **`9a9c659`** on **`mordecai/muse-feed-ui`**. Do not merge or push unless captain says so.

## Phone LAN

`next.config.ts` must keep `allowedDevOrigins: ['192.168.1.123']` or the phone at `http://192.168.1.123:3000` gets HTML with no JS (dead slider / theme / GO NOW). Restart `npm run dev` after changing that list.

## Business and Affiliate

- **Business** ends on `/post`. A `businesses` row is created on first post (`app/post/page.tsx`).
- **Affiliate** ends on `/account`. Every account gets a referral code (`ReferralCard`). No extra account types.
- Auth `next=` allowlist: `/post`, `/account`, `/`, `/business`, `/affiliate`.

## Phase 2 (not this freeze)

- `sk_test_` Stripe + 4242 smoke.
- Deploy only when captain writes **deploy**.

## Do not commit

`.env`, `.env.local`, `next-dev*.log`, `tunnel-*.log`, `_scan.py`.
