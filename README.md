# SmartPick — Credit Card Recommendation Frontend

SmartPick helps users find the best credit card for their spending habits. Users input their monthly spending by category (food, transport, shopping, etc.), and the service either recommends the top matching cards (**NEW** mode) or compares recommendations against their current card (**COMPARE** mode).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + Testing Library
- **Language**: TypeScript 5

## Prerequisites

- Node.js 18+
- A running instance of the [SmartPick backend](https://github.com/SmartPick-org/SmartPick-Neo) (see [Backend Connection](#backend-connection) below)

## Setup

```bash
git clone <this-repo>
cd SmartPick-frontend
npm run dev   # installs dependencies automatically, then starts dev server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other available scripts:

| Command | Description |
|---|---|
| `npm run dev` | Start development server (auto-installs deps via `predev`) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest browser UI |

## Backend Connection

The frontend calls a REST API. The base URL is controlled by the `NEXT_PUBLIC_BASE_URL` environment variable (default: `http://localhost:8000`).

Create a `.env.local` file in the project root to override it:

```
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

> If you are connecting through an [ngrok](https://ngrok.com) tunnel, the app automatically adds the required `ngrok-skip-browser-warning` header.

The project ships with a `.env` file pointing at the team's shared dev server. Override it with `.env.local` for local backend development (`.env.local` takes precedence and is gitignored).

## User Flow

The app is a linear 5-step wizard. State is carried through steps via React context (persisted in `sessionStorage`).

```
Step 1 — Entry (/)
  Choose mode: NEW or COMPARE

Step 2 — Card Selector (/select-card)   [COMPARE mode only]
  Pick your current card from the database

Step 3 — Categories (/categories)
  Choose 2–5 spending categories (food, transport, shopping, …)
  Tap a category card to flip it and select sub-categories

Step 4 — Spending Input (/input-spending)
  Enter total monthly budget
  Adjust per-category amounts and sub-category ratios via sliders
  Live donut chart shows the distribution

Step 5 — Results (/results)
  NEW mode:    Top 3 recommended cards in a horizontal carousel
  COMPARE mode: Side-by-side table — current card vs. recommended cards
                with benefit difference column (+/-)
```

On the results page you can also:
- Open the **AI Card Advisor** panel to ask questions about a card in plain language
- Open the **Benefit Receipt** modal, uncheck specific benefits, and get an instant recalculation

## API Endpoints

All endpoints are under `NEXT_PUBLIC_BASE_URL/api/v1`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/cards` | Fetch all available cards (used in card selector) |
| `POST` | `/cards/recommend` | Get top card recommendations (NEW mode) |
| `POST` | `/cards/compare` | Compare current card with recommendations (COMPARE mode) |
| `POST` | `/cards/recalculate` | Re-score cards after excluding specific benefits |
| `POST` | `/advisor/ask` | Ask the AI advisor a question about a specific card |

### Example request — `/cards/recommend`

```json
{
  "total_budget": 500000,
  "category_spending": {
    "food": {
      "total": 200000,
      "restaurant": "60%",
      "delivery": "40%"
    },
    "transport": {
      "total": 100000,
      "subway": "100%"
    }
  }
}
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages (one folder per route)
│   ├── page.tsx            # Step 1 — Entry
│   ├── select-card/        # Step 2 — Card selector
│   ├── categories/         # Step 3 — Category selection
│   ├── input-spending/     # Step 4 — Spending input
│   └── results/            # Step 5 — Results
├── components/
│   ├── results/            # BenefitReceipt modal, card advisor panel
│   └── markdown/           # Markdown renderer (used for advisor responses)
├── state/
│   ├── appState.tsx        # Global context + reducer (sessionStorage-backed)
│   ├── apiService.ts       # All fetch calls to the backend
│   ├── api.ts              # TypeScript request/response types
│   ├── config.ts           # API base URL config + ngrok header helper
│   └── categories.ts       # Category metadata and Korean↔English key maps
├── utils/
│   └── finance.ts          # Benefit calculation helpers
└── test/
    └── render.tsx          # renderWithProviders() test helper
```

## Running Tests

```bash
npm run test          # single run (CI)
npm run test:watch    # interactive watch mode
npm run test:ui       # browser-based Vitest UI
```

Tests live alongside source files as `*.test.tsx` / `*.test.ts`. Use the `renderWithProviders()` helper from `src/test/render.tsx` to wrap components that need the global app state context.