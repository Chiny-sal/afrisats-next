# ⚡ AfriSats — Lightning Marketplace for Africa

AfriSats is a hackathon MVP that lets you buy digital services and physical goods from African creators using Bitcoin Lightning Network payments. Browse a mixed catalog of ebooks, beat packs, hand-woven textiles, coffee, and more — pay in satoshis, get instant digital delivery or provide shipping details for physical products.

## Tech Stack

- **Next.js 14** (App Router) + React + Tailwind CSS
- **LNbits** demo instance for per-seller Lightning invoice creation & verification
- **CoinGecko** for live BTC/USD rates via `/api/rates` (60s cache, hardcoded fallback)
- **Postgres (Neon)** via Prisma — persistent sellers, items, and orders

The catalog supports both digital and physical products with non-custodial shipping-info handling — buyer addresses are stored on the order and only shown to the buyer (confirmation) and the seller (fulfillment), never elsewhere.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — LNbits keys + full Neon postgresql:// connection strings
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo LNbits Caveat

Uses the **public demo LNbits instance** at `demo.lnbits.com` — real mainnet sats on shared custodial wallets. Prices are intentionally small (300–2,500 sats). Demo wallets may reset periodically.

**For hackathon demos, run on localhost** — the in-memory order store does not persist across serverless cold starts.

## Pages

| Route | Description |
|---|---|
| `/` | Marketplace with search, filters, Lightning checkout |
| `/converter` | Bidirectional sats ⇄ fiat converter |
| `/dashboard` | Buyer/seller transaction history |
| `/sell` | Seller registration & product listing |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | LNbits connection status |
| `/api/items` | GET/POST/PATCH | Catalog CRUD |
| `/api/sellers` | POST | Register seller |
| `/api/sellers/me` | GET | Current seller profile |
| `/api/rates` | GET | BTC/USD + fiat cross-rates |
| `/api/payments/create-invoice` | POST | Create Lightning invoice |
| `/api/payments/verify/[orderId]` | GET | Poll payment status |
| `/api/transactions` | GET | Buyer/seller transaction history |

## License

MIT — built for hackathon demo purposes.
