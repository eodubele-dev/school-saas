const http = require('http');

const sql = `
  INSERT INTO storage.buckets (id, name, public) VALUES ('school-assets', 'school-assets', true) ON CONFLICT (id) DO NOTHING;
  DROP POLICY IF EXISTS "Permissive" ON storage.objects;
  CREATE POLICY "Permissive" ON storage.objects FOR ALL USING (bucket_id = 'school-assets') WITH CHECK (bucket_id = 'school-assets');
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

console.log('Sending SQL to debug endpoint...');

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
