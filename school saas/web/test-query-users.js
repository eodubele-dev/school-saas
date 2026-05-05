import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testQueryAuthUsers() {
    console.log("Testing auth.users query...")
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    })
    
    if (error) {
        console.error("List Users Error:", error)
    } else {
        console.log(`Success! Found ${data.users.length} users with pagination.`)
    }

    console.log("Testing direct DB query...")
    // In PostgREST, you might not be able to query auth schema unless it's exposed, 
    // but we can try a rpc call or maybe it works if exposed. 
    // Let's just try listUsers with a search.
}

testQueryAuthUsers()
