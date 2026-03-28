# Weather App

A full-stack weather application with a multi-provider fallback system. Built with React, NestJS, and TypeScript as an npm workspaces monorepo.

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

Open `http://localhost` in your browser. That's it.

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
│   │       ├── hooks/              # useWeather hook (data fetching + state)
│   │       ├── services/           # API client, icon mapping
│   │       └── types/              # Re-exports from shared
│   └── shared/                     # Shared TypeScript types
│       └── src/
│           └── weather.types.ts    # WeatherData, ForecastDay, etc.
├── docker-compose.yml
├── eslint.config.js
└── .prettierrc
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript |
| Testing | Vitest (31 tests across both packages) |
| Monorepo | npm workspaces |
| Containerization | Docker, docker-compose |
| Linting/Formatting | ESLint, Prettier (standard style) |

### Multi-Provider Fallback

The backend fetches weather data using a provider fallback chain, inspired by the strategy pattern:

1. **OpenWeatherMap** (primary) — 1000 free calls/day
2. **AccuWeather** (first fallback) — 50 free calls/day
3. **Weather.gov** (last resort) — no key required, US-only

Each provider normalizes its response to a shared `WeatherData` schema (defined in `packages/shared`). If a provider fails, the system logs the error and tries the next one. If all fail, it returns a combined error message.

### Key Design Decisions

- **Client-side unit conversion**: The API always returns imperial. The frontend converts to metric via `useMemo`, so toggling units is instant with no network request.
- **Shared types package**: `@weather-app/shared` is a workspace package that both frontend and backend depend on, keeping the `WeatherData` contract in sync.
- **Provider-agnostic icons**: SVG weather icons are mapped by condition text (e.g. "Clouds", "Rain") rather than provider-specific icon codes, so they work regardless of which provider responds.
- **Co-located tests**: Test files live next to the code they test for easy navigation.

### Production-Ready Features

- **Security**: Helmet for HTTP security headers
- **Performance**: gzip compression, server-side caching (5-minute TTL)
- **Rate limiting**: 30 requests/minute via `@nestjs/throttler`
- **Error handling**: Global exception filter with consistent error shape, frontend error states with retry
- **Logging**: Request logging interceptor (method, URL, elapsed time), provider-level logging (which provider served the request, cache hits)
- **Validation**: DTOs with `class-validator` for input validation
- **Health check**: `GET /api/health` for uptime monitoring
- **Graceful shutdown**: `enableShutdownHooks()` for clean container stops
- **Environment validation**: Warns on startup if API keys are missing

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
  "forecast": [
    {
      "date": "2026-03-27",
      "temperatureHigh": 62,
      "temperatureLow": 48,
      "humidity": 65,
      "windSpeed": 4.2,
      "condition": {
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    }
  ]
}
```

## Testing

```bash
# Run all tests
npm test

# Run by package
npm run test -w @weather-app/api    # 15 backend tests
npm run test -w @weather-app/web    # 16 frontend tests

# Watch mode
npm run test:watch -w @weather-app/api
npm run test:watch -w @weather-app/web
```

### Test Coverage

- **WeatherService**: Fallback chain (primary, secondary, tertiary, all-fail), caching, metric conversion, unavailable providers, coordinate queries
- **WeatherController**: City query, coordinate query, validation errors
- **GlobalExceptionFilter**: HTTP exceptions, unknown errors, response shape
- **LoggingInterceptor**: Request logging pipeline
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
