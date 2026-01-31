const http = require('http');

const sql = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students' AND table_schema = 'public';`;

const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug-kv',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    },
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    res.on('end', () => {
        try {
            console.log(JSON.stringify(JSON.parse(responseData), null, 2));
        } catch (e) {
            console.log(responseData);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
