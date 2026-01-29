const { executeSql, rowToGuest } = require('./turso-utils');

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const result = await executeSql('SELECT * FROM guests');
        const guests = result.rows.map(row => rowToGuest(row, result.columns));

        const stats = {
            totalInvited: guests.length,
            attending: guests.filter(g => g.status === 'attending').length,
            pending: guests.filter(g => g.status === 'pending').length,
            declined: guests.filter(g => g.status === 'declined').length,
            totalGuests: guests.reduce((sum, g) => sum + (g.partySize || 0), 0),
            households: guests.length,
            responseRate: guests.length > 0 ? Math.round(
                ((guests.filter(g => g.status !== 'pending').length) / guests.length) * 100
            ) : 0
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(stats)
        };
    } catch (err) {
        console.error('Error fetching stats:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};

