const http = require('http');

const sql = `
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS genotype text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS passport_url text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS house text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_number text UNIQUE;
NOTIFY pgrst, 'reload schema';
`;

const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug-kv',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response body:', responseData);
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
    process.exit(1);
});

req.write(data);
req.end();
