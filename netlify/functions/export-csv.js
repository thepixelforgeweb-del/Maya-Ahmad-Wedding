const { executeSql, rowToGuest } = require('./turso-utils');

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=maya-ahmad-wedding-guests.csv',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const result = await executeSql('SELECT * FROM guests ORDER BY responseDate DESC');
        const guests = result.rows.map(row => rowToGuest(row, result.columns));

        const headerRow = ['First Name', 'Last Name', 'Email', 'Party Size', 'Status', 'Events', 'Meal', 'Dietary', 'Allergies', 'Notes', 'Response Date'];

        const rows = guests.map(g => [
            g.firstName,
            g.lastName,
            g.email,
            g.partySize,
            g.status,
            g.events.join('; '),
            g.meal || '',
            g.dietary.join('; '),
            g.allergies.join('; '),
            g.notes || '',
            g.responseDate || ''
        ]);

        const csv = [
            headerRow.map(h => `"${h}"`).join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return {
            statusCode: 200,
            headers,
            body: csv
        };
    } catch (err) {
        console.error('Error exporting CSV:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message })
        };
    }
};

