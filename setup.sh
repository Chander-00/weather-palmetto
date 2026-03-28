#!/bin/sh

if [ ! -f packages/api/.env ]; then
  cp packages/api/.env.example packages/api/.env
  echo "Created packages/api/.env from .env.example"
  echo "Please add your OPENWEATHER_API_KEY to packages/api/.env before running."
  echo "Get a free key at: https://openweathermap.org/api"
  exit 1
fi

if grep -q "your_openweather_api_key" packages/api/.env; then
  echo "Please replace 'your_openweather_api_key' with a real API key in packages/api/.env"
  echo "Get a free key at: https://openweathermap.org/api"
  exit 1
fi

echo "Environment configured. Starting services..."
docker compose up --build
