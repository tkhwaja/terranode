# TerraNode - Solar Energy Tracking Platform

## Overview

TerraNode is a comprehensive full-stack solar energy tracking platform that allows users to monitor their solar energy production, consumption, and earnings through a gamified system with WATT tokens. The application features a cyberpunk-themed UI with real-time energy data visualization, solar alliance management, and a referral system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Data Visualization**: Chart.js for energy trend charts
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: OpenID Connect with Replit Auth integration
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migration Strategy**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect authentication
- **Session Storage**: PostgreSQL-backed session store with `connect-pg-simple`
- **User Management**: Automatic user creation/update on authentication
- **Security**: HTTP-only cookies with secure flags for production

### Energy Tracking System
- **Real-time Data**: Automatic data generation service for demo purposes
- **Metrics Tracked**: Solar generation, energy consumption, surplus export, WATT tokens earned
- **Data Visualization**: Historical trends, real-time snapshots, progress tracking
- **Gamification**: WATT token rewards based on energy production and efficiency

### Solar Alliance System
- **Community Features**: Users can create and join solar alliances
- **Membership Management**: Alliance creation, joining, and member tracking
- **Collaborative Goals**: Shared energy targets and group achievements

### Referral System
- **Referral Codes**: Unique codes generated for each user
- **Tracking**: Referral statistics and bonus calculations
- **Leaderboard**: Top referrers ranking system

### WATT Wallet
- **Token Management**: Balance tracking, lifetime earnings, daily earnings
- **Milestone System**: Progress tracking toward energy and earning goals
- **Reward Distribution**: Automated token distribution based on energy production

## Data Flow

1. **User Authentication**: 
   - User logs in via Replit OAuth
   - Session created and stored in PostgreSQL
   - User profile created/updated in database

2. **Energy Data Generation**:
   - Background service generates realistic energy data
   - Data stored in `energyReadings` table
   - WATT tokens calculated and awarded

3. **Real-time Updates**:
   - Frontend polls API endpoints every 30 seconds for latest data
   - Charts and metrics update automatically
   - Wallet balance reflects latest earnings

4. **Alliance Management**:
   - Users create/join alliances
   - Alliance statistics aggregated from member data
   - Shared goals and achievements tracked

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon Database connection
- **drizzle-orm**: Type-safe database operations
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **@tanstack/react-query**: Server state management
- **chart.js**: Data visualization
- **@radix-ui/***: Headless UI components

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `REPLIT_DOMAINS`: Allowed domains for OAuth (required)
- `ISSUER_URL`: OpenID Connect issuer URL (defaults to Replit)

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── dist/            # Production build output
└── migrations/      # Database migrations
```

### Key Features
- **Cyberpunk Theme**: Custom CSS variables and styling for futuristic appearance
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Automatic data refresh and live dashboard updates
- **Progressive Enhancement**: Graceful degradation for various device capabilities
- **Type Safety**: Full TypeScript coverage across frontend, backend, and database schemas

The application is designed to be deployed on Replit with automatic database provisioning and authentication integration, making it easy to set up and scale.

## Recent Changes (July 2025)
- **Deployment Complete**: TerraNode successfully deployed to production
- **Live WATT Ticker**: Implemented real-time WebSocket updates for token balance with smooth animations and earning badges
- **Responsive Navigation**: Fixed mobile navigation issues with proper hamburger menu implementation
- **UI Improvements**: Fixed energy chart line colors (green/orange/cyan) and navigation responsiveness
- **Accessibility**: Fixed referral system text colors and navigation breakpoints for better mobile experience
- **Feature Expansion**: Added comprehensive dashboard with 8 main sections including user profiles, milestones, uptime tracking, notifications, and alliance governance
- **Database Schema**: All tables successfully created and operational with real-time data generation