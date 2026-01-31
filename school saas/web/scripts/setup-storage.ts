import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
    console.log('Ensuring school-assets bucket exists...')
    const { data, error } = await supabase.storage.createBucket('school-assets', {
        public: true,
        fileSizeLimit: 2097152
    })

    if (error && error.message !== 'Already exists') {
        console.error('Error creating bucket:', error)
    } else {
        console.log('Bucket school-assets ensured')
    }

    // We rely on the SQL debug endpoint for policies as they are DB level
    const sql = `
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'school-assets');
    
    DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
    CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'school-assets');
    
    DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
    CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'school-assets');
  `

    console.log('Setup complete. Please run the SQL manually if policies are missing.')
}

setupStorage()
