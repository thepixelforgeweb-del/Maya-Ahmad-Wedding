# API Reference

All endpoints work the same on Netlify Functions as they did on your Express server.

## Base URL

- **Local**: `http://localhost:3000`
- **Netlify**: `https://your-site.netlify.app`

## Endpoints

### Guests Management

#### GET /api/guests
Get all guests

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "partySize": 2,
    "status": "attending",
    "events": ["ceremony", "reception"],
    "meal": "beef",
    "dietary": ["vegetarian"],
    "allergies": ["peanuts"],
    "notes": "Arriving early",
    "responseDate": "2026-01-15",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z"
  }
]
```

#### GET /api/guests/:id
Get single guest by ID

**Response:** Single guest object (same structure as above)

#### POST /api/guests
Create new guest (from RSVP form)

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "partySize": 1,
  "status": "attending",
  "events": ["ceremony"],
  "meal": "chicken",
  "dietary": [],
  "allergies": [],
  "notes": ""
}
```

**Response:** Created guest object with ID

#### PUT /api/guests/:id
Update guest

**Request Body:** Same as POST (all fields)

**Response:** Updated guest object

#### DELETE /api/guests/:id
Delete guest

**Response:**
```json
{ "message": "Guest deleted successfully" }
```

### Statistics

#### GET /api/stats
Get dashboard statistics

**Response:**
```json
{
  "totalInvited": 50,
  "attending": 35,
  "pending": 10,
  "declined": 5,
  "totalGuests": 75,
  "households": 50,
  "responseRate": 80
}
```

### Export

#### GET /api/export/csv
Export all guests as CSV

**Response:** CSV file download
```
"First Name","Last Name","Email","Party Size","Status",...
"John","Doe","john@example.com",2,"attending",...
```

### Health Check

#### GET /api/health
Check API status

**Response:**
```json
{
  "status": "ok",
  "message": "Wedding RSVP API is running on Netlify Functions"
}
```

## Status Values

- `pending` — Guest hasn't responded yet
- `attending` — Guest confirmed attendance
- `declined` — Guest declined invitation

## Field Notes

- **events**: Array of event names (e.g., ["ceremony", "reception"])
- **dietary**: Array of dietary restrictions (e.g., ["vegetarian", "gluten-free"])
- **allergies**: Array of food allergies (e.g., ["peanuts", "shellfish"])
- **partySize**: Number of people in the party (default: 1)
- **responseDate**: Date guest responded (ISO format, null if pending)

## Error Responses

### 400 Bad Request
```json
{ "error": "First name, last name, and email are required" }
```

### 404 Not Found
```json
{ "error": "Guest not found" }
```

### 409 Conflict
```json
{ "error": "A guest with this email already exists" }
```

### 500 Server Error
```json
{ "error": "Error message details" }
```

## CORS

All endpoints have CORS enabled. You can call them from:
- Your wedding website
- Admin dashboard
- Mobile app
- Any browser-based client

## Rate Limiting

Netlify Functions have generous rate limits. No special handling needed for typical wedding RSVP traffic.

## Timeouts

Functions have a 26-second timeout. All operations complete well within this limit.

