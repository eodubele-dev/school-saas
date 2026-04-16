
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is missing from .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const emailToDelete = 'ristmaslibrary@gmail.com'

async function deleteUser() {
  console.log(`Searching for user to delete: ${emailToDelete}...`)

  // 1. Find the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    process.exit(1)
  }

  const user = users.find(u => u.email === emailToDelete)

  if (!user) {
    console.error(`User with email ${emailToDelete} not found.`)
    process.exit(1)
  }

  console.log(`Found user: ${user.id}. Deleting...`)

  // 2. Delete the user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Error deleting user:', deleteError.message)
    process.exit(1)
  }

  console.log(`SUCCESS: User ${emailToDelete} has been deleted.`)
  console.log('You can now sign up again with this email.')
}

deleteUser()
