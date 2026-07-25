import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const email = 'admin@meridian.com'
  const password = 'password123'

  console.log(`Checking Supabase Auth for user: ${email}...`)

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Failed to list users:', listError)
    process.exit(1)
  }

  let user = listData?.users?.find((u) => u.email === email)

  if (!user) {
    console.log('Creating new admin user in Supabase Auth...')
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('Error creating admin user:', createError)
      process.exit(1)
    }

    user = createData.user
    console.log(`Created admin user with ID: ${user.id}`)
  } else {
    console.log(`Admin user exists (ID: ${user.id}). Resetting password to "${password}"...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      process.exit(1)
    }
  }

  console.log('Syncing admin_profiles table...')
  const { error: profileError } = await supabase
    .from('admin_profiles')
    .upsert({
      id: user.id,
      full_name: 'Meridian Admin',
      role: 'admin',
    })

  if (profileError) {
    console.error('Error updating admin_profiles:', profileError)
    process.exit(1)
  }

  console.log('SUCCESS: Admin user and profile are synced!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
}

main()
