const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  console.log('Logging in as admin@cove.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@cove.com',
    password: 'CoveAdmin2026!#'
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  console.log('Login successful! JWT token length:', data.session.access_token.length);
  console.log('User role:', data.user.role);

  // Now, let's test if we can sign out using the supabase client
  console.log('Signing out using client...');
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error('SignOut failed:', signOutError.message);
  } else {
    console.log('SignOut successful!');
  }
}

run();
