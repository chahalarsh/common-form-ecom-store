# Common Form

A responsive storefront for thoughtfully selected everyday products, built with
Next.js and MongoDB. The interface is intentionally calm and minimal: clear
product photography, simple navigation, and an uncomplicated shopping bag.

## Features

- MongoDB-backed product collection and individual product pages.
- Related-product suggestions based on the current product category.
- Persistent shopping bag with quantity controls, item removal, and an order
  summary. The bag is stored in the shopper's browser using `localStorage`.
- Saved light and dark appearance preferences, with support for the device's
  current theme when no preference has been chosen.
- Category browsing and product matching, with immediate ranked text matches
  and semantic search for queries without a close text match.
- Responsive collection, product, cart, and about pages.
- Accessible navigation, focus states, reduced-motion support, and loading,
  empty, and error states.

Checkout, accounts, and payment processing are not part of this demo yet.

## Tech stack

- Next.js 16 App Router and React 19
- MongoDB with Mongoose
- OpenRouter AI embeddings for semantic product search
- CSS Modules and responsive CSS

## Getting started

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Configure `MONGO_URI` in your local `.env` or `.env.local` file. The example
   file shows a local MongoDB URI; an Atlas connection string also works. Keep
   real environment files private and never commit them.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000).

The catalog and cart pages require a reachable MongoDB instance. Semantic
product matching uses `OPENROUTER_API_KEY` for queries without a close text
match; ranked text matching works without it.

## Demo catalog

The existing seed endpoint creates sample products. After configuring
`MONGO_URI`, call it once:

```bash
curl http://localhost:3000/api/seed
```

**Caution:** this endpoint replaces the existing product collection. It is
intended for local development only; do not expose it in a production
deployment. If `OPENROUTER_API_KEY` is configured, the endpoint also creates
embeddings for semantic search.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Storefront landing page |
| `/shop` | Product collection, category filters, and semantic search |
| `/products/[id]` | Product details and related products |
| `/cart` | Saved shopping bag and order summary |
| `/about` | About Common Form |
| `/api/Products` | MongoDB product catalog |
| `/api/ai-search` | Embedding-based product search |
| `/api/seed` | Development-only sample catalog seeding |

