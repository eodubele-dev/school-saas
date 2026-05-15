
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

const emailToConfirm = 'ristmaslibrary@gmail.com'

async function confirmUser() {
  console.log(`Checking for user with email: ${emailToConfirm}...`)

  // 1. Find the user
  const { data: { users }, error: getError } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email === emailToConfirm)

  if (getError) {
    if (getError.message.includes('Database error')) {
        console.error('Supabase returned a database error while looking up the user. This often means the Auth schema is locked or the Service Role key permissions are being restricted.')
    }
    console.error('Error getting user:', getError.message)
    process.exit(1)
  }

  if (!user) {
    console.error(`User with email ${emailToConfirm} not found in Supabase Auth.`)
    process.exit(1)
  }

  console.log(`Found user: ${user.id}. Current status: ${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`)

  if (user.email_confirmed_at) {
    console.log('User is already confirmed. No action needed.')
    return
  }

  // 2. Confirm the user
  console.log('Confirming user...')
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  )

  if (updateError) {
    console.error('Error confirming user:', updateError.message)
    process.exit(1)
  }

  console.log(`SUCCESS: User ${emailToConfirm} has been manually confirmed!`)
  console.log('You can now log in or continue the registration flow.')
}

confirmUser()
