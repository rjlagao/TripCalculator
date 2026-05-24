# TripCalculator

A React Native mobile app that estimates trip fuel consumption and cost based on your vehicle's fuel efficiency, with live (or fallback) gasoline and diesel prices.

## Architecture

```
TripCalculator/
├── server/          # Express API + SQLite database
└── mobile/          # Expo React Native app
```

### Features

- **Vehicle database** — Store vehicles with make, model, year, fuel type (gasoline/diesel), and consumption (L/100km)
- **Trip calculator** — Enter distance, pick a vehicle, get fuel needed and estimated cost
- **Fuel prices API** — Separate gasoline and diesel prices by country (CollectAPI with fallback defaults)

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm
- [Expo Go](https://expo.dev/go) on your phone (SDK 54), or Android Studio / Xcode simulator

## Quick Start

### 1. Start the API server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Windows `Cannot find module 'node:path'`?** Your `npm` is running old Node 12 while a newer global npm expects Node 18+. Use either fix:

```bash
# Option A — bypass npm (recommended for now)
.\dev.cmd

# Option B — run dev directly
node node_modules/tsx/dist/cli.mjs watch src/index.ts
```

**Permanent fix:** Reinstall [Node.js 22 LTS](https://nodejs.org) so `C:\Program Files\nodejs\node.exe` is v18+ (yours is currently v12).

The API runs at `http://localhost:3001`.

### 2. Start the mobile app

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

### 3. Configure API URL for your device

Edit `mobile/app.json` → `expo.extra.apiUrl`:

| Environment | URL |
|---|---|
| Android emulator | `http://10.0.2.2:3001` |
| iOS simulator | `http://localhost:3001` |
| Physical device | `http://<your-computer-ip>:3001` |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles` | Create a vehicle |
| PUT | `/api/vehicles/:id` | Update a vehicle |
| DELETE | `/api/vehicles/:id` | Delete a vehicle |
| GET | `/api/fuel-prices?country=US` | Get gasoline & diesel prices |
| POST | `/api/trips/calculate` | Calculate trip cost |

### Create vehicle example

```json
POST /api/vehicles
{
  "name": "Daily Commuter",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "fuelType": "gasoline",
  "consumptionPer100km": 6.5
}
```

### Calculate trip example

```json
POST /api/trips/calculate?country=US
{
  "vehicleId": 1,
  "distanceKm": 250
}
```

## Live Fuel Prices (optional)

Set `FUEL_PRICE_API_KEY` in `server/.env` with a key from [CollectAPI Gas Price](https://collectapi.com/api/gasPrice/gas-price-api). Without a key, the server uses built-in default prices for US, GB, and DE.

## Database

Vehicles are stored in SQLite at `server/data/tripcalculator.db`. Two sample vehicles are seeded on first run.

## Trip calculation formula

```
fuelNeeded (L) = (distanceKm / 100) × consumptionPer100km
estimatedCost  = fuelNeeded × pricePerLiter (gasoline or diesel based on vehicle)
```
