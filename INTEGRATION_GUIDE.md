# RSVP Form to API Integration Guide

This guide explains how to connect the wedding RSVP forms (desktop and mobile) to the backend API.

## Overview

The forms currently save data to `localStorage` (browser storage). We're upgrading them to send data to a backend API for:
- Persistent storage in a database
- Real-time dashboard updates
- Better data management and export

## Step 1: Update Desktop Form (maya-ahmad-wedding-desktop.html)

Find the form submission handler (around line 1732) and replace it:

```javascript
// OLD CODE (localStorage):
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // ... saves to localStorage ...
});

// NEW CODE (API):
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

    // Determine status
    const status = events.length > 0 ? 'attending' : 'declined';

    // Build guest data
    const guestData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        partySize: parseInt(formData.get('guestCount')) || 1,
        status: status,
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

        const result = await response.json();
        console.log('RSVP submitted successfully:', result);

        // Show success message
        this.style.display = 'none';
        document.getElementById('successMessage').classList.add('show');
        document.getElementById('successMessage').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });

    } catch (error) {
        console.error('RSVP submission error:', error);
        alert('Error submitting RSVP: ' + error.message);
    }
});
```

## Step 2: Update Mobile Form (maya-ahmad-wedding-mobile.html)

Find the form submission handler (around line 3350) and replace it:

```javascript
// NEW CODE (API):
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const attending = document.querySelector('input[name="attendance"]:checked').value;
    
    // Build events array from selections
    const events = [];
    if (eventSelections.bohemian === 'yes') events.push('welcome');
    if (eventSelections.wedding === 'yes') {
        events.push('ceremony');
        events.push('reception');
    }
    if (eventSelections.pool === 'yes') events.push('brunch');

    // Build dietary array
    const dietary = [];
    document.querySelectorAll('input[name="dietary"]:checked').forEach(checkbox => {
        dietary.push(checkbox.value);
    });

    // Build guest data
    const guestData = {
        firstName: document.getElementById('guestName').value,
        lastName: '', // Mobile form may not have last name, use full name
        email: document.getElementById('guestEmail').value,
        partySize: guestCount,
        status: attending === 'yes' ? 'attending' : 'declined',
        events: events,
        dietary: dietary,
        allergies: [],
        notes: document.getElementById('guestMessage').value || ''
    };

    // If no separate last name field, split the full name
    const nameParts = guestData.firstName.trim().split(' ');
    if (nameParts.length > 1) {
        guestData.firstName = nameParts[0];
        guestData.lastName = nameParts.slice(1).join(' ');
    } else {
        guestData.lastName = guestData.firstName;
    }

    try {
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

        const result = await response.json();
        console.log('RSVP submitted successfully:', result);

        // Show success message
        form.style.display = 'none';
        document.getElementById('successMessage').classList.add('show');

    } catch (error) {
        console.error('RSVP submission error:', error);
        alert('Error submitting RSVP: ' + error.message);
    }
});
```

## Step 3: Update Dashboard (dashboard.html)

Add the API integration script to `dashboard.html` (before the closing `</body>` tag):

```html
<!-- Add this before </body> in dashboard.html -->
<script src="dashboard-api.js"></script>
```

Then modify the dashboard's `saveGuest()` function to use the API:

```javascript
// Find the original saveGuest() function and add API support:
async function saveGuest() {
    const firstName = document.getElementById('guest-first-name').value.trim();
    const lastName = document.getElementById('guest-last-name').value.trim();
    const email = document.getElementById('guest-email').value.trim();
    const partySize = parseInt(document.getElementById('guest-party-size').value) || 1;
    const status = document.getElementById('guest-status').value;
    const meal = document.getElementById('guest-meal').value;
    const notes = document.getElementById('guest-notes').value.trim();

    if (!firstName || !lastName) {
        alert('Please enter first and last name');
        return;
    }

    // Build data object
    const events = [];
    if (document.getElementById('event-welcome-check').checked) events.push('welcome');
    if (document.getElementById('event-ceremony-check').checked) events.push('ceremony');
    if (document.getElementById('event-reception-check').checked) events.push('reception');
    if (document.getElementById('event-brunch-check').checked) events.push('brunch');

    const dietary = [];
    if (document.getElementById('dietary-vegetarian').checked) dietary.push('vegetarian');
    if (document.getElementById('dietary-vegan').checked) dietary.push('vegan');
    if (document.getElementById('dietary-gluten-free').checked) dietary.push('gluten-free');
    if (document.getElementById('dietary-halal').checked) dietary.push('halal');
    if (document.getElementById('dietary-kosher').checked) dietary.push('kosher');
    if (document.getElementById('dietary-dairy-free').checked) dietary.push('dairy-free');

    const guestData = {
        firstName,
        lastName,
        email,
        partySize,
        status,
        events,
        meal,
        dietary,
        allergies: [...currentAllergies],
        notes,
        responseDate: status !== 'pending' ? new Date().toISOString().split('T')[0] : null
    };

    // Try API first, fallback to localStorage
    if (window.apiConnected) {
        const success = await saveGuestToAPI(guestData);
        if (success) {
            closeModal();
            return;
        }
    }

    // Fallback: save to localStorage
    if (editingGuestId) {
        const index = guests.findIndex(g => g.id === editingGuestId);
        if (index !== -1) {
            guests[index] = { ...guests[index], ...guestData };
        }
    } else {
        guestData.id = Math.max(...guests.map(g => g.id), 0) + 1;
        guests.push(guestData);
    }

    localStorage.setItem('weddingGuests', JSON.stringify(guests));
    closeModal();
    updateAllStats();
    renderRecentResponses();
    renderGuestTable();
    renderEventTables();
    renderDietarySummary();
}
```

## Step 4: Error Handling & Fallbacks

Add error handling to gracefully handle API failures:

```javascript
// Helper function for API calls with fallback
async function apiCall(method, endpoint, data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`/api${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call failed (${method} ${endpoint}):`, error);
        return null;
    }
}
```

## Step 5: Testing the Integration

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test form submission:**
   - Open `http://localhost:3000`
   - Fill out and submit the RSVP form
   - Check the dashboard to see if the guest appears

3. **Test dashboard:**
   - Open `http://localhost:3000/dashboard`
   - Add a new guest via the "Add Guest" button
   - Verify it appears in the guest list and statistics

4. **Test API directly:**
   ```bash
   curl -X GET http://localhost:3000/api/guests
   curl -X GET http://localhost:3000/api/stats
   ```

## Troubleshooting

### Form submissions not appearing on dashboard

1. **Check browser console** for errors (F12 → Console tab)
2. **Verify API is running**: `curl http://localhost:3000/api/health`
3. **Check CORS**: Forms should make requests to same domain
4. **Database issue**: Delete `wedding.db` and restart server

### "Duplicate email" errors

The API prevents multiple RSVPs from the same email. To allow updates:
- Use the dashboard to edit existing guests
- Or delete the guest and re-submit the form

### Port already in use

```bash
# Use a different port
PORT=3001 npm start
```

## Next Steps

After integration is working:

1. **Add authentication** to dashboard (protect with password)
2. **Deploy to production** (Heroku, Railway, etc.)
3. **Set up HTTPS** for security
4. **Monitor database** for performance
5. **Add email notifications** when RSVPs are received

---

Questions? Check the main README_API.md for complete API documentation.
