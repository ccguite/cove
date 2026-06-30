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
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        env[key] = val;
      }
    }
  });
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

async function run() {
  // We can't query pg_policies directly through Supabase select() unless we use RPC
  // but let's check if we can query any table or if RPC is available
  // Actually, we can use a query on pg_policies by executing a RPC or just querying if there is any exposed view.
  // Wait! Is there an RPC or endpoint? No.
  // Let's try to query pg_policies?
  const { data, error } = await supabase.from('pg_policies').select('*');
  console.log('pg_policies query:');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(data);
  }
}

run();
