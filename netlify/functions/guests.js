const { executeSql, rowToGuest } = require('./turso-utils');

exports.handler = async (event) => {
    // Enable CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const path = event.path;
        const idMatch = path.match(/\/api\/guests\/(\d+)/);
        const id = idMatch ? idMatch[1] : null;

        // GET all guests
        if (event.httpMethod === 'GET' && !id) {
            const result = await executeSql('SELECT * FROM guests ORDER BY responseDate DESC, createdAt DESC');
            const guests = result.rows.map(row => rowToGuest(row, result.columns));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(guests)
            };
        }

        // GET single guest by ID
        if (event.httpMethod === 'GET' && id) {
            const result = await executeSql('SELECT * FROM guests WHERE id = ?', [id]);
            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Guest not found' })
                };
            }
            const guest = rowToGuest(result.rows[0], result.columns);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(guest)
            };
        }

        // POST new guest
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const {
                firstName,
                lastName,
                email,
                partySize = 1,
                status = 'pending',
                events = [],
                meal = '',
                dietary = [],
                allergies = [],
                notes = ''
            } = body;

            if (!firstName || !lastName || !email) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'First name, last name, and email are required' })
                };
            }

            const responseDate = status !== 'pending' ? new Date().toISOString().split('T')[0] : null;

            const result = await executeSql(
                `INSERT INTO guests (firstName, lastName, email, partySize, status, events, meal, dietary, allergies, notes, responseDate)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    firstName,
                    lastName,
                    email,
                    partySize,
                    status,
                    JSON.stringify(events),
                    meal,
                    JSON.stringify(dietary),
                    JSON.stringify(allergies),
                    notes,
                    responseDate
                ]
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    id: result.lastInsertRowid,
                    firstName,
                    lastName,
                    email,
                    partySize,
                    status,
                    events,
                    meal,
                    dietary,
                    allergies,
                    notes,
                    responseDate
                })
            };
        }

        // PUT update guest
        if (event.httpMethod === 'PUT' && id) {
            const body = JSON.parse(event.body || '{}');
            const {
                firstName,
                lastName,
                email,
                partySize,
                status,
                events = [],
                meal,
                dietary = [],
                allergies = [],
                notes
            } = body;

            const responseDate = status !== 'pending' ? new Date().toISOString().split('T')[0] : null;

            await executeSql(
                `UPDATE guests
                 SET firstName = ?, lastName = ?, email = ?, partySize = ?, status = ?,
                     events = ?, meal = ?, dietary = ?, allergies = ?, notes = ?, responseDate = ?, updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    firstName,
                    lastName,
                    email,
                    partySize,
                    status,
                    JSON.stringify(events),
                    meal,
                    JSON.stringify(dietary),
                    JSON.stringify(allergies),
                    notes,
                    responseDate,
                    id
                ]
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ id, firstName, lastName, email, partySize, status, events, meal, dietary, allergies, notes, responseDate })
            };
        }

        // DELETE guest
        if (event.httpMethod === 'DELETE' && id) {
            await executeSql('DELETE FROM guests WHERE id = ?', [id]);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Guest deleted successfully' })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };

    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};

