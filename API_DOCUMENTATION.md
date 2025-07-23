# TerraNode API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All authenticated endpoints require a valid session cookie. The application uses OpenID Connect for production and a development bypass for localhost.

### Auth Endpoints

#### POST /api/login
Initiates the OAuth login flow.
- Redirects to OAuth provider
- No request body required

#### GET /api/logout
Logs out the current user.
- Clears session
- Redirects to home page

#### GET /api/auth/user
Returns the current authenticated user.

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-07-23T00:00:00Z",
  "updatedAt": "2025-07-23T00:00:00Z"
}
```

## Energy Management

### GET /api/energy/latest
Get the latest energy reading for the current user.

**Response:**
```json
{
  "id": 1,
  "userId": "user-123",
  "timestamp": "2025-07-23T18:00:00Z",
  "solarGeneration": 5.2,
  "energyConsumption": 3.8,
  "surplusExport": 1.4,
  "tokenEarnings": 14,
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

### GET /api/energy/history
Get historical energy data.

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2025-07-23T00:00:00Z",
    "solarGeneration": 5.2,
    "energyConsumption": 3.8,
    "surplusExport": 1.4,
    "tokenEarnings": 14
  }
]
```

### GET /api/energy/chart-data
Get aggregated data for charts.

**Response:**
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "solarGeneration": [4.5, 5.2, 4.8, 5.5, 5.1, 4.9, 5.0],
  "energyConsumption": [3.2, 3.8, 3.5, 4.0, 3.7, 3.6, 3.9],
  "surplusExport": [1.3, 1.4, 1.3, 1.5, 1.4, 1.3, 1.1]
}
```

## Token Management

### GET /api/tokens/balance
Get current WATT token balance.

**Response:**
```json
{
  "balance": 1250.5,
  "lifetimeEarnings": 5420.3,
  "dailyEarnings": 125.2,
  "lastUpdated": "2025-07-23T18:00:00Z"
}
```

### GET /api/tokens/history
Get token transaction history.

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "amount": 14,
    "type": "earned",
    "reason": "Solar generation bonus",
    "timestamp": "2025-07-23T18:00:00Z"
  }
]
```

## Solar Alliances

### GET /api/alliances
List all available alliances.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Solar Warriors",
    "description": "Leading the solar revolution",
    "createdBy": "user-123",
    "memberCount": 25,
    "totalSurplus": 125.4,
    "createdAt": "2025-07-01T00:00:00Z"
  }
]
```

### POST /api/alliances
Create a new alliance.

**Request Body:**
```json
{
  "name": "Alliance Name",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Alliance Name",
  "description": "Optional description",
  "createdBy": "user-123",
  "createdAt": "2025-07-23T18:00:00Z"
}
```

### POST /api/alliances/:id/join
Join an existing alliance.

**Response:**
```json
{
  "success": true,
  "allianceId": 1,
  "userId": "user-123"
}
```

### GET /api/alliances/user
Get alliances the current user is a member of.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Solar Warriors",
    "memberCount": 25,
    "totalSurplus": 125.4,
    "joinedAt": "2025-07-15T00:00:00Z"
  }
]
```

### GET /api/alliance-pulse
Get community-wide alliance progress.

**Response:**
```json
{
  "currentTotal": 123.5,
  "weeklyGoal": 100,
  "progressPercent": 123.5,
  "statusEmoji": "🚀",
  "hasAlliance": true,
  "allianceName": "Solar Warriors"
}
```

## Daily Missions

### GET /api/daily-mission
Get the current daily mission.

**Response:**
```json
{
  "id": 1,
  "userId": "user-123",
  "missionType": "generate_energy",
  "targetValue": 50,
  "currentValue": 32.5,
  "status": "incomplete",
  "dateAssigned": "2025-07-23T00:00:00Z",
  "completedAt": null,
  "emoji": "⚡",
  "description": "Generate 50 kW of solar energy today"
}
```

### POST /api/daily-mission/progress
Update mission progress (called automatically by system).

**Request Body:**
```json
{
  "missionType": "generate_energy",
  "progressValue": 5.2
}
```

## Referrals

### GET /api/referrals/code
Get user's referral code.

**Response:**
```json
{
  "referralCode": "SOLAR-ABC123",
  "referralCount": 5,
  "bonusEarned": 250
}
```

### GET /api/referrals/leaderboard
Get referral leaderboard.

**Response:**
```json
[
  {
    "userId": "user-123",
    "username": "SolarChampion",
    "referralCount": 15,
    "rank": 1
  }
]
```

## Milestones

### GET /api/milestones
Get all available milestones.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Solar Starter",
    "description": "Generate your first 100 kW",
    "targetValue": 100,
    "category": "generation",
    "icon": "sun",
    "reward": 50
  }
]
```

### GET /api/milestones/user
Get user's milestone progress.

**Response:**
```json
[
  {
    "milestoneId": 1,
    "currentValue": 75.5,
    "completed": false,
    "completedAt": null,
    "progress": 75.5
  }
]
```

## Notifications

### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `unread` (optional): Filter only unread notifications

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "type": "milestone_achieved",
    "title": "Milestone Achieved!",
    "message": "You've completed Solar Starter milestone",
    "isRead": false,
    "createdAt": "2025-07-23T18:00:00Z"
  }
]
```

### POST /api/notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true
}
```

## Admin Endpoints

### POST /api/seed-demo-data
Generate demo data for testing (development only).

**Request Body:**
```json
{
  "days": 7,
  "hoursPerDay": 24
}
```

**Response:**
```json
{
  "success": true,
  "energyRecords": 168,
  "totalTokensEarned": 2352
}
```

### GET /api/test/token-update
Test WebSocket token updates.

**Response:**
```json
{
  "success": true,
  "message": "Token update sent via WebSocket"
}
```

## WebSocket API

Connect to WebSocket at: `ws://localhost:5000/ws`

### Events

#### token-update
Sent when user's token balance changes.
```json
{
  "type": "token-update",
  "userId": "user-123",
  "balance": 1250.5,
  "earned": 14,
  "timestamp": "2025-07-23T18:00:00Z"
}
```

#### energy-update
Sent when new energy reading is recorded.
```json
{
  "type": "energy-update",
  "userId": "user-123",
  "solarGeneration": 5.2,
  "energyConsumption": 3.8,
  "timestamp": "2025-07-23T18:00:00Z"
}
```

#### alliance-update
Sent when alliance activity occurs.
```json
{
  "type": "alliance-update",
  "allianceId": 1,
  "event": "member_joined",
  "data": {
    "userId": "user-456",
    "username": "NewMember"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error