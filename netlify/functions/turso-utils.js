// Shared Turso utilities for Netlify Functions
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const httpUrl = TURSO_DATABASE_URL.replace('libsql://', 'https://');

// Helper to safely inline parameters into SQL
function inlineParams(sql, args = []) {
	if (!args || args.length === 0) return sql;

	let index = 0;
	return sql.replace(/\?/g, () => {
	    if (index >= args.length) return 'NULL';
	    const value = args[index++];

	    if (value === null || value === undefined) {
	        return 'NULL';
	    }
	    if (typeof value === 'number') {
	        return String(value);
	    }
	    if (typeof value === 'boolean') {
	        return value ? '1' : '0';
	    }

	    const str = String(value).replace(/'/g, "''");
	    return `'${str}'`;
	});
}

// Database helper function
async function executeSql(sql, args = []) {
	const url = `${httpUrl}/v2/pipeline`;
	const finalSql = inlineParams(sql, args);

	const body = {
	    requests: [
	        {
	            type: 'execute',
	            stmt: {
	                sql: finalSql
	            }
	        }
	    ]
	};

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('❌ Turso HTTP Error:', error);
        throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();

    if (result.results && result.results[0] && result.results[0].response.result) {
        const dbResult = result.results[0].response.result;
        return {
            rows: dbResult.rows || [],
            columns: dbResult.cols || [],
            lastInsertRowid: dbResult.last_insert_rowid
        };
    }

    return { rows: [], columns: [] };
}

// Helper function to convert row array to object
function rowToGuest(row, columns) {
    const guest = {};
    columns.forEach((col, index) => {
        const cell = row[index];
        const colName = typeof col === 'object' ? col.name : col;
        if (cell && typeof cell === 'object') {
            if (cell.type === 'null') {
                guest[colName] = null;
            } else if ('value' in cell) {
                guest[colName] = cell.value;
            } else {
                guest[colName] = cell;
            }
        } else {
            guest[colName] = cell;
        }
    });

    return {
        id: guest.id ? parseInt(guest.id) : null,
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        email: guest.email || '',
        partySize: guest.partySize ? parseInt(guest.partySize) : 1,
        status: guest.status || 'pending',
        events: guest.events ? JSON.parse(guest.events) : [],
        meal: guest.meal || '',
        dietary: guest.dietary ? JSON.parse(guest.dietary) : [],
        allergies: guest.allergies ? JSON.parse(guest.allergies) : [],
        notes: guest.notes || '',
        responseDate: guest.responseDate || null,
        createdAt: guest.createdAt || null,
        updatedAt: guest.updatedAt || null
    };
}

module.exports = { executeSql, rowToGuest, inlineParams };

