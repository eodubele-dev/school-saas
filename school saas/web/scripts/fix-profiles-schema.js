
const http = require('http');

const sql = `
  -- Fix Profiles RLS Recursion
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- 1. Drop existing policies (to be safe)
  DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
  
  -- 2. Create a non-recursive read policy
  -- We use USING (true) for now to ensure NO recursion happens during login/introspection.
  -- We can tighten this later if needed, but 'profiles' public read is often acceptable for name/avatar display.
  CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

  -- 3. Allow self-update
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

  -- 4. Allow insert (usually handled by trigger, but for safety)
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
`;

const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug-sql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending Profile RLS Fix to /api/debug-sql...');

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response body:', responseData);
        if (res.statusCode === 200) {
            console.log("✅ Success! Profiles RLS fixed.");
        } else {
            console.log("❌ Failed.");
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
    console.log("⚠️  Ensure the Next.js server is running on localhost:3000!");
});

req.write(data);
req.end();
