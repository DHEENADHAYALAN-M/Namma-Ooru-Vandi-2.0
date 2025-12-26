# Namma Ooru Vandi - Transit Tracker

## Overview
A real-time public transport tracking application for Chennai. The app allows passengers to track live buses, drivers to update trip status and passenger count, and admins to manage fleet operations.

## Project Structure
```
.
├── client/           # React frontend (Vite)
│   ├── src/          # React components and pages
│   ├── public/       # Static assets
│   └── index.html    # HTML template
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── storage.ts    # In-memory data storage
│   ├── vite.ts       # Vite middleware setup
│   └── static.ts     # Static file serving
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Zod schemas for data validation
│   └── routes.ts     # API route definitions
└── script/           # Build scripts
    └── build.ts      # Production build script
```

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, TypeScript
- **Data**: In-memory storage (no database required)
- **Mapping**: Leaflet, React-Leaflet

## Key Features
- **Demo GPS Mode**: Default mode using fixed Trichy-based coordinates for simulation
- **ESP GPS Priority**: Location source priority (ESP > Demo > Simulation)
- **Trichy Routes**: Fixed routes (Central → Thillai Nagar, Central → Srirangam, Chatram → Woraiyur)
- **Driver Controls**: Start/Stop trip and passenger count slider with instant sync
- **Passenger UI**: Auto-focus on selected bus and smooth interpolation between updates

## Running the Application
- **Development**: `npm run dev` - Starts the Express server with Vite middleware on port 5000
- **Production Build**: `npm run build` - Builds client and bundles server
- **Production Run**: `npm run start` - Runs the production build

## API Routes
- `POST /api/login` - Login with role selection (passenger/driver/admin)
- `POST /api/logout` - Logout current session
- `GET /api/me` - Get current user session
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get specific bus
- `PATCH /api/buses/:id/status` - Update bus status (driver only)
- `POST /api/buses/:id/esp` - ESP hardware data update

## Default Users
- Passenger: Tracks buses on map
- Driver: Controls bus status
- Admin: System overview
