const http = require('http');

const sql = `
-- Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to READ tenants (needed for branding display)
DROP POLICY IF EXISTS "Allow Public Read Tenants" ON public.tenants;
CREATE POLICY "Allow Public Read Tenants" ON public.tenants 
FOR SELECT TO authenticated USING (true);

-- Allow admins to UPDATE their own tenant
DROP POLICY IF EXISTS "Allow Admin Update Own Tenant" ON public.tenants;
CREATE POLICY "Allow Admin Update Own Tenant" ON public.tenants 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.tenant_id = tenants.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.tenant_id = tenants.id
  )
);
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

req.on('error', (e) => {
    console.error('Error:', e);
    process.exit(1);
});

req.write(data);
req.end();
