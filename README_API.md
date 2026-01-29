# Maya & Ahmad Wedding RSVP System

A full-stack wedding RSVP and guest management system with a beautiful frontend and powerful backend API.

## Features

- 🎉 Responsive wedding website with RSVP form (desktop & mobile)
- 📊 Admin dashboard for managing guests and viewing statistics
- 🔄 Real-time API for guest management
- 💾 SQLite database for persistent storage
- 📥 CSV export functionality
- 🎨 Beautiful, elegant UI with wedding theme colors

## Project Structure

```
maya-ahmad-wedding/
├── index.html                      # Device detector (redirects to mobile/desktop)
├── maya-ahmad-wedding-desktop.html # Desktop version with RSVP form
├── maya-ahmad-wedding-mobile.html  # Mobile version with RSVP form
├── dashboard.html                  # Admin dashboard
├── server.js                        # Express.js backend API
├── package.json                     # Node.js dependencies
└── wedding.db                       # SQLite database (auto-created)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **sqlite3** - Database

### 2. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Access the Website

- **Main Site**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API Health Check**: http://localhost:3000/api/health

## API Endpoints

### Guest Management

#### Get All Guests
```
GET /api/guests
```
Returns all guests with their RSVP details.

#### Get Single Guest
```
GET /api/guests/:id
```
Returns a specific guest by ID.

#### Create New Guest (RSVP)
```
POST /api/guests
Content-Type: application/json

{
  "firstName": "Sarah",
  "lastName": "Mitchell",
  "email": "sarah@example.com",
  "partySize": 2,
  "status": "attending",
  "events": ["welcome", "ceremony", "reception"],
  "meal": "fish",
  "dietary": ["gluten-free"],
  "allergies": ["shellfish"],
  "notes": "Plus one is my husband"
}
```

#### Update Guest
```
PUT /api/guests/:id
Content-Type: application/json

{
  "firstName": "Sarah",
  "lastName": "Mitchell",
  "email": "sarah@example.com",
  ...same fields as POST...
}
```

#### Delete Guest
```
DELETE /api/guests/:id
```

### Dashboard Data

#### Get Statistics
```
GET /api/stats
```
Returns guest count statistics:
```json
{
  "totalInvited": 50,
  "attending": 35,
  "pending": 10,
  "declined": 5,
  "totalGuests": 75,
  "households": 50,
  "responseRate": 70
}
```

#### Export Data as CSV
```
GET /api/export/csv
```
Downloads a CSV file with all guest data.

### Health Check
```
GET /api/health
```
Returns API status.

## How to Connect the Form to the API

The website forms (desktop and mobile) need to be updated to send data to the API instead of localStorage.

### Example: Update Desktop Form Submission

In `maya-ahmad-wedding-desktop.html`, replace the form submission handler:

```javascript
document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    
    // Build events array
    const events = [];
    if (formData.get('bohemianNight') === 'yes') events.push('welcome');
    if (formData.get('ceremonyReception') === 'yes') {
        events.push('ceremony');
        events.push('reception');
    }
    if (formData.get('poolDay') === 'yes') events.push('brunch');

    // Build guest data
    const guestData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        partySize: parseInt(formData.get('guestCount')) || 1,
        status: events.length > 0 ? 'attending' : 'declined',
        events: events,
        dietary: formData.getAll('dietary') || [],
        allergies: formData.get('allergies') 
            ? formData.get('allergies').split(',').map(a => a.trim()).filter(a => a) 
            : [],
        notes: formData.get('notes') || ''
    };

    try {
        // Send to API
        const response = await fetch('/api/guests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guestData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit RSVP');
        }

        // Show success message
        this.style.display = 'none';
        document.getElementById('successMessage').classList.add('show');
        document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('RSVP submission error:', error);
        alert('Error submitting RSVP: ' + error.message);
    }
});
```

## Dashboard Features

### Overview Section
- Total invited count
- Attending count with response rate
- Pending RSVPs
- Declined RSVPs

### Guest Management
- View all guests with details
- Add new guests
- Edit existing guests
- Delete guests
- Search and filter guests
- Filter by event attendance

### Event Tracking
- Track attendance by event (Welcome, Ceremony, Reception, Brunch)
- See meal preferences per event
- View dietary requirements by event

### Dietary & Allergies
- Summary of dietary restrictions
- Allergy tracking
- Dietary preference breakdown

### Export
- Download all guest data as CSV
- Includes all RSVP details in spreadsheet format

## Database Schema

### guests Table
```sql
CREATE TABLE guests (
    id INTEGER PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    partySize INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',  -- 'pending', 'attending', 'declined'
    events TEXT,                     -- JSON array
    meal TEXT,
    dietary TEXT,                    -- JSON array
    allergies TEXT,                  -- JSON array
    notes TEXT,
    responseDate TEXT,
    createdAt DATETIME,
    updatedAt DATETIME
);
```

## Error Handling

All API endpoints return appropriate HTTP status codes:
- **200** - Success
- **201** - Created
- **400** - Bad request (missing required fields)
- **404** - Not found
- **409** - Conflict (duplicate email)
- **500** - Server error

## Security Considerations

For production deployment:

1. **Add Authentication**
   - Protect dashboard with password/JWT
   - Only allow logged-in users to manage guests

2. **Input Validation**
   - Sanitize all inputs
   - Validate email addresses
   - Limit text field lengths

3. **HTTPS**
   - Use SSL/TLS certificates
   - Enforce secure connections

4. **Environment Variables**
   - Move database path to config
   - Store API keys securely

5. **Rate Limiting**
   - Limit API requests per IP
   - Prevent form spam

## Example Usage

### Submit RSVP from Frontend
```javascript
const rsvpData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    partySize: 2,
    status: 'attending',
    events: ['ceremony', 'reception'],
    dietary: ['vegetarian'],
    allergies: ['peanuts'],
    notes: 'Looking forward to it!'
};

fetch('/api/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvpData)
})
.then(res => res.json())
.then(data => console.log('RSVP submitted:', data))
.catch(err => console.error('Error:', err));
```

### Fetch Guest Statistics
```javascript
fetch('/api/stats')
    .then(res => res.json())
    .then(stats => {
        console.log(`${stats.attending} guests attending`);
        console.log(`${stats.responseRate}% have responded`);
    });
```

## Troubleshooting

**Port already in use:**
```bash
# Use a different port
PORT=3001 npm start
```

**Database locked error:**
- Close any other connections to the database
- Delete `wedding.db` and restart (loses data)

**CORS errors:**
- Ensure the client is making requests to the same origin
- Check that CORS middleware is enabled in server.js

## Support

For issues or questions, contact the development team.

---

**Happy Wedding Planning! 🎉💍**
