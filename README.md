# Weather App

A full-stack weather application with a multi-provider fallback system, city comparison, smart alerts, and an interactive map. Built with React, NestJS, and TypeScript as an npm workspaces monorepo.

## Quick Start (Docker)

The fastest way to get running:

```bash
git clone <repo-url>
cd weather-app-palmetto

# Add your API key
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env — at minimum set OPENWEATHER_API_KEY

# Run everything
docker compose up --build
```

Open `http://localhost:8080` in your browser. That's it.

> Get a free OpenWeatherMap API key at [openweathermap.org/api](https://openweathermap.org/api) (takes 2 minutes). AccuWeather key is optional. Weather.gov requires no key but only covers the US.

## Quick Start (Local Development)

```bash
# Prerequisites: Node.js 18+, npm 7+

npm install

cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env with your API key(s)

npm run dev
```

Frontend runs on `http://localhost:5173`, API on `http://localhost:3001`. The frontend proxies `/api` requests to the backend automatically.

## Features

### Multi-Provider Fallback
The backend fetches weather data using a provider fallback chain:
1. **OpenWeatherMap** (primary) — 1000 free calls/day
2. **AccuWeather** (first fallback) — 50 free calls/day
3. **Weather.gov** (last resort) — no key required, US-only

Each provider normalizes its response to a shared `WeatherData` schema. If a provider fails, the system retries with exponential backoff, then falls back to the next provider. A per-provider circuit breaker prevents wasting time on providers that are persistently down.

### Smart Weather Alerts
Server-side alert engine that analyzes current conditions and hourly forecasts:
- Extreme heat/cold warnings with severity levels
- Wind and visibility advisories
- **Predictive alerts** — scans hourly forecast data to warn about upcoming rain, snow, or thunderstorms (e.g., "Rain expected within 3 hours — consider bringing an umbrella")

### Hourly Forecast
Horizontal scrollable strip showing the next 24 hours in 3-hour intervals with temperature, weather icon, and precipitation chance percentage.

### City Comparison
Compare weather between two cities side-by-side:
- Click "Compare" to open a second search bar
- Both cities display their current conditions, details, and alerts in a split view
- Interactive map shows both locations with markers and a connecting line
- Close comparison anytime with the X button

### Interactive Map
Dark-themed map (CartoDB tiles via Leaflet) centered on the searched city. In comparison mode, the map auto-zooms to fit both cities and draws a dashed line between them.

### Weather Character
SVG character that changes outfit based on conditions — t-shirt for warm weather, hoodie for mild, jacket for cold, heavy coat with scarf for freezing. Adds sunglasses in heat, umbrella in rain, snowflakes in snow. Shows a contextual message like "Grab a hoodie" or "Bring an umbrella!"

### Feels Like Context
Instead of just showing "Feels like 22°C", explains why — "(humidity makes it warmer)" or "(wind chill makes it colder)".

### Share Weather Card
Screenshot-ready weather card that can be downloaded as PNG or copied to clipboard. Opens as a modal with the city's current conditions formatted for sharing.

### Favorite Cities
Star cities to pin them. Favorites appear as highlighted chips for quick access, persisted in localStorage.

### Search History
Recent searches saved in localStorage (max 8), shown as clickable chips below the search bar. Favorites and history are visually distinct.

### Keyboard Shortcuts
- `/` or `Ctrl+K` — focus search bar
- `Esc` — blur search / dismiss

### Auto-Refresh
Weather data auto-refreshes every 5 minutes for the current city. A "Last updated" timestamp shows when data was last fetched.

### Unit Toggle
Switch between °C and °F instantly — conversion happens client-side via `useMemo`, no network request needed.

## Architecture

```
weather-app-palmetto/
├── packages/
│   ├── api/                        # NestJS backend
│   │   └── src/
│   │       ├── common/
│   │       │   ├── context/        # Request tracing (AsyncLocalStorage + trace IDs)
│   │       │   ├── filters/        # Global exception filter
│   │       │   ├── interceptors/   # Request logging
│   │       │   └── logger/         # Structured JSON logger (NDJSON)
│   │       ├── config/             # Environment validation
│   │       ├── health/             # Health check module
│   │       └── weather/
│   │           ├── dto/            # Request/response DTOs
│   │           ├── interfaces/     # Provider contract
│   │           ├── providers/      # OpenWeather, AccuWeather, Weather.gov
│   │           └── circuit-breaker.ts  # Per-provider circuit breaker
│   ├── web/                        # React + Vite + Tailwind CSS
│   │   └── src/
│   │       ├── components/         # UI components with co-located tests
│   │       ├── hooks/              # useWeather, useSearchHistory, useFavorites, useKeyboardShortcuts
│   │       ├── services/           # API client, icon mapping
│   │       └── types/              # Re-exports from shared
│   └── shared/                     # Shared TypeScript types
│       └── src/
│           └── weather.types.ts    # WeatherData, HourlyForecast, WeatherAlert, etc.
├── docker-compose.yml
├── eslint.config.js
└── .prettierrc
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Leaflet |
| Backend | NestJS 11, TypeScript |
| Testing | Vitest (44 tests across both packages) |
| Monorepo | npm workspaces |
| Containerization | Docker, docker-compose |
| Linting/Formatting | ESLint, Prettier (standard style) |

### Key Design Decisions

- **Client-side unit conversion**: The API always returns imperial. The frontend converts to metric via `useMemo`, so toggling units is instant with no network request.
- **Shared types package**: `@weather-app/shared` is a workspace package that both frontend and backend depend on, keeping the `WeatherData` contract in sync.
- **Co-located tests**: Test files live next to the code they test for easy navigation.
- **npm workspaces over Nx**: For a three-package monorepo, Nx adds significant tooling overhead (config files, plugins, build graph) without meaningful benefit. npm workspaces gives us shared dependencies, cross-package linking, and workspace scripts with zero extra dependencies. If this grew to 5+ packages with complex build dependencies, Nx would start paying for itself with its caching and task orchestration.

### Production-Ready Features

- **Security**: Helmet for HTTP security headers
- **Performance**: gzip compression, server-side caching (5-minute TTL)
- **Rate limiting**: 30 requests/minute via `@nestjs/throttler`
- **Resilience**: Per-provider circuit breaker (trips after 3 failures, 30s cooldown), retry with exponential backoff (up to 2 retries, 500ms/1s delays), 10-second timeouts on all external HTTP calls
- **Error handling**: Global exception filter with consistent error shape, proper 404 for not-found cities, frontend error states with retry
- **Logging**: Request trace IDs (`trace_id`) on every log line, structured JSON logs written to `packages/api/logs.jsonl` (NDJSON format, ready for Datadog/ELK), request logging interceptor (method, URL, elapsed time), provider-level logging
- **Validation**: DTOs with `class-validator` for input validation
- **Health check**: `GET /api/health` for uptime monitoring
- **Graceful shutdown**: `enableShutdownHooks()` for clean container stops
- **Environment validation**: Warns on startup if API keys are missing

## Production Deployment

In production, images should be built once and pushed to a container registry, not built on every deploy:

```bash
# Build and push images (CI/CD)
docker build -f Dockerfile.api -t registry.example.com/weather-api .
docker build -f Dockerfile.web -t registry.example.com/weather-web .
docker push registry.example.com/weather-api
docker push registry.example.com/weather-web
```

Then deploy with `docker-compose.prod.yml` or an orchestrator (ECS, Kubernetes, etc.) that pulls the pre-built images. Environment variables should be injected via the orchestrator's secret management, not `.env` files.

For a minimal VPS deploy:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Resilience Patterns

The backend implements three layers of resilience for external API calls:

### Request Timeouts
All outbound HTTP requests to weather providers have a **10-second timeout**. Without this, a single hung upstream API blocks the request indefinitely and prevents the fallback chain from executing. This is the foundation — circuit breakers and retries are meaningless if a request can hang forever.

### Retry with Exponential Backoff
Transient failures (network blips, momentary 503s from rate limiting) are retried up to **2 times** with increasing delays (500ms, 1s). Non-retryable errors — 404 (city not found), 401/403 (bad API key) — skip retries immediately to avoid wasting time on errors that won't resolve themselves.

### Per-Provider Circuit Breaker
Each weather provider has an independent circuit breaker with three states:
- **CLOSED** (normal): requests flow through. After **3 consecutive failures**, the circuit trips to OPEN.
- **OPEN** (fast-fail): the provider is skipped entirely for **30 seconds**. No HTTP calls are made — the fallback chain moves to the next provider immediately.
- **HALF_OPEN** (probe): after the 30s cooldown, one request is allowed through. Success → CLOSED. Failure → back to OPEN.

**Why all three together?** Timeouts prevent indefinite hangs. Retries recover from transient blips. Circuit breakers prevent cascading failure — without them, if OpenWeather goes down, every request wastes ~3.5s (3 attempts + backoff) before falling back. With the circuit breaker, after 3 requests prove it's down, subsequent requests skip it instantly.

## API Documentation

Swagger docs are available at `/api/docs` when running in development mode. A static OpenAPI spec (`swagger.json`) is also generated in the API build output directory on every dev startup — you can import it into Postman or any OpenAPI-compatible tool. The spec is a build artifact (not committed to git).

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/weather` | Get weather by city or coordinates |
| GET | `/api/health` | Health check |

### Query Parameters (`/api/weather`)

| Param | Type | Required | Description |
|---|---|---|---|
| `city` | string | Either city or lat+lon | City name (e.g., "London") |
| `lat` | number | Either city or lat+lon | Latitude (-90 to 90) |
| `lon` | number | Either city or lat+lon | Longitude (-180 to 180) |
| `units` | string | No | `"metric"` or `"imperial"` (default) |

### Example Response

```json
{
  "provider": "openweather",
  "location": {
    "name": "London",
    "country": "GB",
    "coordinates": { "lat": 51.5074, "lon": -0.1278 }
  },
  "current": {
    "temperature": 59,
    "feelsLike": 57,
    "humidity": 72,
    "pressure": 1013,
    "windSpeed": 5.4,
    "windDirection": 220,
    "visibility": 10000,
    "uvIndex": null,
    "condition": {
      "main": "Clouds",
      "description": "overcast clouds",
      "icon": "04d"
    }
  },
  "hourly": [
    {
      "time": "2026-03-27T18:00:00",
      "temperature": 61,
      "condition": { "main": "Clouds", "description": "overcast clouds", "icon": "04d" },
      "precipitationChance": 20
    }
  ],
  "forecast": [
    {
      "date": "2026-03-27",
      "temperatureHigh": 62,
      "temperatureLow": 48,
      "humidity": 65,
      "windSpeed": 4.2,
      "condition": { "main": "Clear", "description": "clear sky", "icon": "01d" }
    }
  ],
  "alerts": [
    {
      "severity": "info",
      "message": "Rain expected within 6 hours — consider bringing an umbrella"
    }
  ]
}
```

## Testing

```bash
# Run all tests
npm test

# Run by package
npm run test -w @weather-app/api    # 28 backend tests
npm run test -w @weather-app/web    # 16 frontend tests

# Watch mode
npm run test:watch -w @weather-app/api
npm run test:watch -w @weather-app/web
```

### Test Coverage

**Backend (28 tests)**
- **WeatherService**: Fallback chain (primary, secondary, tertiary, all-fail), caching, metric conversion, unavailable providers, coordinate queries, circuit breaker + retry integration
- **WeatherController**: City query, coordinate query, validation errors
- **WeatherAlertsService**: Heat, cold, wind, visibility, UV, humidity alerts, upcoming rain/snow/thunderstorm detection, deduplication when already raining
- **GlobalExceptionFilter**: HTTP exceptions, unknown errors, response shape
- **LoggingInterceptor**: Request logging pipeline

**Frontend (16 tests)**
- **useWeather hook**: Default units, client-side conversion, unit toggle without refetch, error handling
- **SearchBar**: Form submission, input trimming, loading state, empty input guard
- **CurrentWeather**: Location display, temperature rendering, description
- **Forecast**: Title, today label, empty state

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | Recommended | OpenWeatherMap API key |
| `ACCUWEATHER_API_KEY` | Optional | AccuWeather API key (fallback) |
| `PORT` | No | API server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` (default: development) |
| `CORS_ORIGIN` | No | Allowed CORS origin. In development, defaults to `*` (any origin). In production, defaults to `*` — set this to your domain (e.g., `https://weather.example.com`) to restrict access. |
