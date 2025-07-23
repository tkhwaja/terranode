# TerraNode - Solar Energy Tracking Platform

## Overview

TerraNode is a comprehensive full-stack solar energy tracking platform that allows users to monitor their solar energy production, consumption, and earnings through a gamified system with WATT tokens. The application features a cyberpunk-themed UI with real-time energy data visualization, solar alliance management, and a referral system.

## Features

- **Real-time Energy Tracking**: Monitor solar generation, energy consumption, and surplus export
- **WATT Token System**: Earn tokens based on energy production and efficiency
- **Daily Missions**: Gamified goals to encourage sustainable energy habits
- **Solar Alliances**: Create and join communities for collective solar goals
- **Alliance Pulse**: Track community-wide solar progress
- **Energy Visualization**: Interactive charts and maps for energy data
- **Referral System**: Invite friends and earn bonus rewards
- **Milestone Achievements**: Progress tracking and badge system
- **Real-time Updates**: WebSocket-powered live data updates

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Radix UI + shadcn/ui for components
- TanStack Query for state management
- Chart.js for data visualization
- Wouter for routing
- Vite for build tooling

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- Neon Database (serverless PostgreSQL)
- OpenID Connect authentication (Replit Auth)
- WebSocket support for real-time updates

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon Database account)
- Environment variables configured (see below)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGDATABASE=your_database_name
PGHOST=your_host
PGPASSWORD=your_password
PGPORT=5432
PGUSER=your_user

# Authentication
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your_domain.com,localhost
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc

# Development
NODE_ENV=development
PORT=5000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/terranode.git
cd terranode
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Development

### Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── services/        # Business logic
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── dist/                # Production build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Apply database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

### Development Authentication

When running locally on `localhost`, the application uses a development authentication bypass. This creates a mock user session for testing without requiring Replit authentication.

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Log out user
- `GET /api/auth/user` - Get current user

### Energy
- `GET /api/energy/latest` - Get latest energy reading
- `GET /api/energy/history` - Get historical energy data
- `POST /api/energy` - Create energy reading (automated)

### Alliances
- `GET /api/alliances` - List all alliances
- `POST /api/alliances` - Create new alliance
- `POST /api/alliances/:id/join` - Join an alliance
- `GET /api/alliance-pulse` - Get community progress

### Daily Missions
- `GET /api/daily-mission` - Get current daily mission
- `POST /api/daily-mission/progress` - Update mission progress

### Tokens
- `GET /api/tokens/balance` - Get WATT token balance
- `GET /api/tokens/history` - Get transaction history

## WebSocket Events

The application uses WebSocket for real-time updates:

- `token-update` - Live WATT token balance updates
- `energy-update` - Real-time energy data
- `alliance-update` - Alliance activity notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Replit
- UI inspired by cyberpunk aesthetics
- Solar energy data generation algorithms based on real-world patterns