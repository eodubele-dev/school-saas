
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const emailToDelete = 'ristmaslibrary@gmail.com'

async function deleteUserDirectly() {
  console.log(`Searching for user directly via API: ${emailToDelete}...`)

  const url = `${supabaseUrl}/auth/v1/admin/users`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceRoleKey!,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
       console.error('API Error Response:', JSON.stringify(data, null, 2))
       return
    }

    const user = data.users.find((u: any) => u.email === emailToDelete)

    if (!user) {
      console.log(`User ${emailToDelete} not found.`)
      return
    }

    console.log(`Found user ${user.id}. Deleting...`)

    const deleteResponse = await fetch(`${url}/${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceRoleKey!,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      }
    })

    if (deleteResponse.ok) {
      console.log(`SUCCESS: User ${emailToDelete} deleted successfully!`)
    } else {
      const deleteData = await deleteResponse.json()
      console.error('Delete Error Response:', JSON.stringify(deleteData, null, 2))
    }

  } catch (error: any) {
    console.error('Fetch error:', error.message)
  }
}

deleteUserDirectly()
