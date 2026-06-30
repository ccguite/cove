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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

async function run() {
  const { data, error } = await supabase.from('rooms').select('id, name, slug, image_url');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('ROOMS_DUMP_START');
    console.log(JSON.stringify(data, null, 2));
    console.log('ROOMS_DUMP_END');
  }
}

run();
