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

Each provider normalizes its response to a shared `WeatherData` schema. If a provider fails, the system logs the error and tries the next one.

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
│   │       │   ├── filters/        # Global exception filter
│   │       │   └── interceptors/   # Request logging
│   │       ├── config/             # Environment validation
│   │       ├── health/             # Health check module
│   │       └── weather/
│   │           ├── dto/            # Request/response DTOs
│   │           ├── interfaces/     # Provider contract
│   │           └── providers/      # OpenWeather, AccuWeather, Weather.gov
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
| Testing | Vitest (43 tests across both packages) |
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
- **Error handling**: Global exception filter with consistent error shape, proper 404 for not-found cities, frontend error states with retry
- **Logging**: Request logging interceptor (method, URL, elapsed time), provider-level logging (which provider served the request, cache hits)
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

## API Documentation

Swagger docs are available at `/api/docs` when the server is running.

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
npm run test -w @weather-app/api    # 27 backend tests
npm run test -w @weather-app/web    # 16 frontend tests

# Watch mode
npm run test:watch -w @weather-app/api
npm run test:watch -w @weather-app/web
```

### Test Coverage

**Backend (27 tests)**
- **WeatherService**: Fallback chain (primary, secondary, tertiary, all-fail), caching, metric conversion, unavailable providers, coordinate queries
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
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `http://localhost:5173`) |
