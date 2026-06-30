const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let env = {};
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Error: URL or Anon Key is missing');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function testUser(email, password, expectedRole) {
  console.log(`Testing sign-in for ${email}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error(`❌ Failed to sign in as ${email}:`, signInError.message);
    return false;
  }

  const user = signInData.user;
  console.log(`✅ Signed in successfully as ${user.email}. ID: ${user.id}`);

  // Fetch the role from public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error(`❌ Failed to fetch profile from public.users:`, profileError.message);
    return false;
  }

  if (profile.role !== expectedRole) {
    console.error(`❌ Unexpected role. Expected: ${expectedRole}, Found: ${profile.role}`);
    return false;
  }

  console.log(`✅ Profile verified. Name: "${profile.name}", Role: "${profile.role}"`);
  
  // Sign out
  await supabase.auth.signOut();
  return true;
}

async function run() {
  const adminOk = await testUser('admin@cove.com', 'CoveAdmin2026!#', 'admin');
  console.log('-----------------------------------');
  const staffOk = await testUser('staff@cove.com', 'CoveStaff2026!#', 'staff');
  
  if (adminOk && staffOk) {
    console.log('\n🎉 SUCCESS: Seeding verified successfully!');
  } else {
    console.error('\n❌ FAILURE: Seeding verification failed.');
    process.exit(1);
  }
}

run();
