# Weather App

A full-stack weather application built with React and NestJS as an npm workspaces monorepo.

## Architecture

- **Frontend** (`packages/web`): React 19 + Vite + Tailwind CSS 4
- **Backend** (`packages/api`): NestJS with multi-provider weather API fallback
- **Testing**: Vitest across both packages

### Multi-Provider Fallback

The API aggregates weather data from three providers with automatic failover:

1. **OpenWeatherMap** (primary) — 1000 free calls/day
2. **AccuWeather** (fallback) — 50 free calls/day
3. **Weather.gov** (fallback) — no API key required, US-only

If the primary provider fails, the system automatically tries the next one, accumulating errors. All responses are normalized to a consistent schema regardless of the source.

### Key Features

- Server-side caching (5-minute TTL) to reduce API calls
- Rate limiting (30 requests/minute)
- Swagger API docs at `/api/docs`
- Unit/°F and Metric/°C toggle with server-side conversion
- Geolocation support
- Responsive design with dark theme
- Input validation via DTOs with class-validator
- Health check endpoint at `/api/health`

## Quick Start

### Prerequisites

- Node.js 18+
- npm 7+ (for workspaces support)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd weather-app-palmetto
npm install

# 2. Configure API keys
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env with your API keys
```

At minimum you need an OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api)). AccuWeather key is optional (fallback). Weather.gov requires no key.

```bash
# 3. Run both frontend and backend
npm run dev
```

The API runs on `http://localhost:3001` and the frontend on `http://localhost:5173` (with proxy to the API).

### Running Tests

```bash
# All tests
npm test

# Individual packages
npm run test -w @weather-app/api
npm run test -w @weather-app/web
```

### Building for Production

```bash
npm run build
```

## API Documentation

Once running, Swagger docs are available at: `http://localhost:3001/api/docs`

### Endpoints

| Method | Path           | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/api/weather` | Get weather by city or coordinates   |
| GET    | `/api/health`  | Health check                         |

#### Query Parameters (`/api/weather`)

| Param  | Type   | Description                    |
|--------|--------|--------------------------------|
| city   | string | City name (e.g., "London")     |
| lat    | number | Latitude (-90 to 90)           |
| lon    | number | Longitude (-180 to 180)        |
| units  | string | "metric" or "imperial" (default) |

Provide either `city` or `lat`+`lon`.

## Project Structure

```
weather-app-palmetto/
├── packages/
│   ├── api/                          # NestJS backend
│   │   └── src/
│   │       ├── health/               # Health check module
│   │       ├── weather/
│   │       │   ├── dto/              # Request/response DTOs
│   │       │   ├── interfaces/       # Provider interface
│   │       │   ├── providers/        # OpenWeather, AccuWeather, Weather.gov
│   │       │   ├── weather.service   # Fallback orchestration + caching
│   │       │   └── weather.controller
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/                          # React frontend
│       └── src/
│           ├── components/           # UI components
│           ├── hooks/                # useWeather hook
│           ├── services/             # API client
│           ├── types/                # TypeScript types
│           └── styles/               # Tailwind base
└── package.json                      # Workspace root
```
