# Project Context

## Purpose
A fast, real-time NHL analytics web app for fans and analysts that pulls live NHL API data during games, stores it for historical analysis, and delivers live dashboards, advanced metrics, and AI-assisted insights with minimal latency and maximum reliability.

## Tech Stack
- **Backend:** Laravel (PHP 8.3), Laravel Scheduler, Laravel Queues (Horizon-style), Laravel Reverb (real-time WebSockets)
- **Frontend:** Inertia.js, React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui
- **Client data layer:** TanStack Query (server-state caching, refetching, invalidation)
- **Datastores:** Supabase Postgres (primary truth store), Redis (cache + queues + rate limiting)
- **Infrastructure:** Docker Desktop, Docker Desktop Kubernetes (local), DigitalOcean Kubernetes (production), DO Managed Redis (production), Supabase Hosted Postgres or DO Managed Postgres (production)

## Project Conventions

### Code Style
- **PHP/Laravel**
  - PSR-12 conventions
  - Use strict typing where possible
  - Prefer typed properties and explicit return types
  - Use Form Requests for validation
  - Use Laravel Resources for API responses
- **React/TypeScript**
  - TypeScript strict mode enabled
  - Functional components only
  - Prefer composition over inheritance
  - Avoid prop drilling: use TanStack Query for server state, Zustand only for UI state if needed
- **Formatting / linting**
  - Prettier for TS/React
  - Pint for Laravel formatting (optional but recommended)

### Architecture Patterns
- **Primary pattern:** Cache-first, event-driven, read-optimized architecture
- **Ingestion pipeline**
  - Scheduler detects live games and dispatches ingestion jobs
  - Workers pull NHL API data, normalize events, and write to Postgres
  - Redis stores “hot” snapshots for low-latency reads
- **Truth vs read model**
  - Postgres (Supabase) is the durable truth store
  - Redis is the fast read model (snapshots + derived objects with TTL)
- **Real-time updates**
  - Reverb broadcasts *signals*, not heavy state
  - Clients receive `GameUpdated(gameId)` events and invalidate TanStack Query caches to refetch
- **Frontend data management**
  - TanStack Query is the single source of truth for server-state
  - Zustand (optional) for local UI state only (filters, modals, panel state)

### Testing Strategy
- **Backend**
  - PHPUnit feature tests for core endpoints
  - Job tests for ingestion correctness (idempotency + event parsing)
  - Basic integration tests for DB + Redis write paths
- **Frontend**
  - Minimal smoke tests: build succeeds + pages render
  - Component testing optional; prioritize data correctness and performance
- **Performance**
  - Track cache hit rate
  - Profile slow endpoints (snapshot/analytics)
  - Validate query counts and indexing before production

### Git Workflow
- `main` = production-ready
- `dev` = integration branch
- Feature branches:
  - `feature/<topic>`
  - `fix/<bug>`
- PRs required for merge to `dev` and `main`
- Conventional commits recommended:
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`
  - `refactor: ...`
  - `perf: ...`
- CI checks must pass before merge (build + lint + tests where applicable)

## Domain Context
- **Primary source:** NHL public API (game feeds, schedule, rosters, standings, team and player stats)
- **Cadence**
  - Live games: update every **1–5 seconds** depending on state
  - Pre/post-game: update every **30–120 seconds**
  - Standings: update every **5–10 minutes** (or event-driven)
- **Analytics goals**
  - Live dashboards: play-by-play, shot maps, basic advanced stats
  - Season analytics: trends, comparisons, player/team performance
  - AI features: summaries, “what changed,” insight generation, anomaly detection
- **Data model goals**
  - Append-only event storage for play-by-play
  - Snapshot tables for fast reads and quick reconstruction
  - Derived analytics tables for precomputed metrics

## Important Constraints
- **API stability**
  - NHL API may change without notice; must handle failures gracefully
  - Implement retries, exponential backoff, and circuit breaker behavior
- **Rate limits**
  - Assume rate limiting exists; enforce caching, dedupe calls, and avoid redundant polling
- **Caching TTL strategy (Redis)**
  - live snapshot: 3–10 seconds
  - events list: 10–30 seconds
  - standings: 60–300 seconds
  - rosters: hours
  - cache keys must be versioned (`v1`) for safe migration
- **Real-time update strategy**
  - Do not push entire game state over sockets
  - Broadcast update signals only; clients refetch via TanStack Query
  - Throttle invalidations to avoid refetch storms
- **Deployment**
  - Local:
    - Supabase + Redis run as Docker containers
    - App runs in Docker Desktop Kubernetes cluster
  - Production:
    - App runs in DigitalOcean Kubernetes (DOKS)
    - DB + Redis run as managed services outside Kubernetes

## External Dependencies
- **NHL API** (primary data source)
- **Supabase** (Postgres + Studio; optional storage/realtime)
- **Redis**
- **Docker Desktop**
- **Docker Desktop Kubernetes**
- **DigitalOcean Kubernetes (production)**
- Optional:
  - Cloudflare (CDN + caching)
  - Sentry (error tracking)
  - Observability stack (Prometheus/Grafana)
  - AI provider (OpenAI or similar)
