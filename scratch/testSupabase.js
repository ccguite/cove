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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: URL or Service Key is missing');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  const { data, error } = await supabase.from('rooms').select('*');
  console.log('Service Role Rooms Query Result:');
  if (error) {
    console.error('Error querying rooms with service key:', error);
  } else {
    console.log('Success! Rooms count:', data ? data.length : 0);
  }
}

run();
