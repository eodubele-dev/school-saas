const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a SQL file path.');
    process.exit(1);
}

const sql = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');

const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug-kv',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log(`Sending SQL from ${filePath} to debug endpoint...`);

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Response status:', res.statusCode);
        try {
            console.log('Response body:', JSON.stringify(JSON.parse(responseData), null, 2));
        } catch (e) {
            console.log('Response body:', responseData);
        }
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
    process.exit(1);
});

req.write(data);
req.end();
