# TerraNode Architecture Documentation

## System Overview

TerraNode is built as a full-stack TypeScript application with a clear separation between frontend, backend, and shared code.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Express Server │────▶│   PostgreSQL    │
│   (TypeScript)  │◀────│   (TypeScript)  │◀────│    (Neon DB)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌─────────────────┐               │
         └─────────────▶│   WebSocket     │◀──────────────┘
                        │   Real-time     │
                        └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI + shadcn/ui**: Headless component library
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing
- **Chart.js**: Data visualization
- **Vite**: Build tool

### Directory Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn)
│   ├── EnergyChart.tsx # Energy visualization
│   ├── WattWallet.tsx  # Token management
│   └── ...
├── pages/              # Route components
│   ├── dashboard.tsx   # Main dashboard
│   └── landing.tsx     # Landing page
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── lib/                # Utilities
│   ├── queryClient.ts  # API client setup
│   └── authUtils.ts    # Auth helpers
└── App.tsx             # Root component
```

### Key Design Patterns

#### 1. Component Composition
Components are designed to be composable and reusable:
```typescript
// Example: Card component composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### 2. Server State Management
TanStack Query handles all server state:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/resource'],
  refetchInterval: 30000, // Auto-refresh
});
```

#### 3. Real-time Updates
WebSocket integration for live data:
```typescript
useEffect(() => {
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    // Handle real-time updates
  };
}, []);
```

## Backend Architecture

### Technology Stack
- **Node.js + Express**: Server framework
- **TypeScript**: Type safety
- **Drizzle ORM**: Type-safe database queries
- **PostgreSQL**: Primary database
- **Passport.js**: Authentication middleware
- **WebSocket (ws)**: Real-time communication

### Directory Structure
```
server/
├── services/           # Business logic
│   ├── dataGenerator.ts    # Energy data generation
│   ├── demoSeeder.ts      # Demo data seeding
│   └── autoSeeder.ts      # Automatic data generation
├── routes.ts          # API route definitions
├── storage.ts         # Data access layer
├── replitAuth.ts      # Authentication setup
├── db.ts              # Database connection
└── index.ts           # Server entry point
```

### Key Design Patterns

#### 1. Storage Interface Pattern
All database operations go through a storage interface:
```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createAlliance(data: InsertAlliance): Promise<Alliance>;
  // ... other methods
}
```

#### 2. Service Layer
Business logic is separated into services:
```typescript
class DataGenerator {
  async generateEnergyData(userId: string) {
    // Complex business logic here
  }
}
```

#### 3. Middleware Chain
Express middleware for authentication and validation:
```typescript
app.get('/api/protected', 
  isAuthenticated,      // Auth middleware
  validateRequest,      // Validation
  async (req, res) => { // Handler
    // Route logic
  }
);
```

## Database Architecture

### Schema Design
Using Drizzle ORM for type-safe schemas:

```typescript
// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Energy readings table
export const energyReadings = pgTable("energy_readings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  solarGeneration: real("solar_generation"),
  energyConsumption: real("energy_consumption"),
  surplusExport: real("surplus_export"),
  tokenEarnings: real("token_earnings"),
});
```

### Data Relationships
- Users → Energy Readings (1:N)
- Users → Alliance Memberships (N:M)
- Alliances → Alliance Members (1:N)
- Users → Token Ledger (1:N)
- Users → Daily Missions (1:N)

## Real-time Architecture

### WebSocket Implementation
```
Client ←→ WebSocket Server ←→ Database
   ↓            ↓              ↓
Updates    Broadcasts    Triggers
```

### Event Types
1. **token-update**: Live WATT balance updates
2. **energy-update**: Real-time energy readings
3. **alliance-update**: Alliance activity notifications

## Security Architecture

### Authentication Flow
1. User clicks login → Redirect to Replit OAuth
2. Replit validates → Returns with tokens
3. Server creates session → Stores in PostgreSQL
4. Client receives session → Authenticated requests

### Security Measures
- HTTP-only session cookies
- CSRF protection via SameSite cookies
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM
- XSS protection via React

## Performance Optimization

### Frontend
- Code splitting with dynamic imports
- Image lazy loading
- Memoization of expensive computations
- Virtual scrolling for large lists

### Backend
- Database connection pooling
- Query result caching
- Batch operations for bulk updates
- WebSocket connection management

### Database
- Indexed columns for frequent queries
- Materialized views for aggregations
- Partitioned tables for time-series data

## Deployment Architecture

### Production Setup
```
┌─────────────┐
│   Replit    │
│   Deploy    │
└──────┬──────┘
       │
┌──────▼──────┐     ┌─────────────┐
│   Express   │────▶│  Neon DB    │
│   Server    │     │ PostgreSQL  │
└──────┬──────┘     └─────────────┘
       │
┌──────▼──────┐
│Static Assets│
│  (React)    │
└─────────────┘
```

### Environment Configuration
- Development: Local PostgreSQL, dev auth bypass
- Production: Neon DB, Replit OAuth

## Future Architecture Considerations

### Scalability
- Horizontal scaling with load balancer
- Redis for session storage
- Message queue for background jobs
- CDN for static assets

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database query analysis
- Real-time metric dashboards