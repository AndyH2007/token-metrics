# Token Metrics Indices & Indicators Viewer

This is a small production-style Next.js app built for the Token Metrics Crypto Full-Stack Developer Intern take-home.

It demonstrates:

- Listing key items derived from **Indices** and **Indicators** (using the public `/v2/tokens` endpoint).
- A **30-day detail view** for each item via a dedicated **server-side API route**.
- All external calls done **server-side with API keys in env**, never in the client.
- **Caching (90s)** and **rate limiting** to respect plan limits (20 req/min, 500 calls/month).
- An architecture that can be **swapped to the paid Indices APIs** with minimal code changes.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Runtime:** Node.js ≥ 20.9.0
- **Data Source:** Token Metrics public API (`/v2/tokens`)
- **Patterns:** Server-side routes, env-based secrets, in-memory cache, soft rate limiting, simple SVG chart

---

## App Overview

### Home (`/`)

The home page shows two sections:

- **Indices**  
  - Data from `GET /api/indices`
  - Derived from top market cap tokens via `/v2/tokens`
  - Each item links to a 30-day detail view at `/item/[id]`

- **Indicators**  
  - Data from `GET /api/indicators`
  - Derived from largest absolute 24h movers via `/v2/tokens`
  - Uses the same internal structure and can share the same detail view route

Both sections are read-only views backed by server-side routes that handle caching and rate limiting.

---

### 30-Day Detail View (`/item/[id]`)

For any selected item:

1. The page calls **`/api/item/[id]`** on the **server**, not directly from the browser.
2. The API route:
   - Fetches the token using `/v2/tokens?token_id=...` via the shared `apiClient`.
   - Generates a synthetic 30-day time series based on:
     - Current price
     - 24h percentage change
     - Small deterministic variations for readability
3. Returns data in the form:

```json
{
  "id": "240",
  "name": "Example Token",
  "symbol": "EXT",
  "series": [
    { "t": "2025-10-08", "v": 1.2345 },
    ...
  ],
  "note": "30-day curve generated from free /tokens snapshot. Swap to paid indices/history endpoints via this route."
}
