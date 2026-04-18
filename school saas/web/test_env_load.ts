
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly
const result = dotenv.config({ path: '.env.local' });

console.log('Dotenv result:', result.error ? 'Error loading' : 'Success');
console.log('SUPABASE_SERVICE_ROLE_KEY exists in process.env:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Length of key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10));
}
