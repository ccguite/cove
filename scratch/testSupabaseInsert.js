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

if (!url || !anonKey) {
  console.error('Error: URL or Anon Key is missing');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  // Test insert into slot_locks
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  // Try inserting a mock slot lock
  // We need a valid room_id, let's fetch it first
  const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
  if (!rooms || rooms.length === 0) {
    console.error('No rooms found to test slot lock insert');
    return;
  }
  const roomId = rooms[0].id;
  console.log('Using Room ID:', roomId);

  const { data, error } = await supabase
    .from('slot_locks')
    .insert({
      room_id: roomId,
      date: '2026-06-20',
      start_time: '14:00:00',
      duration_hours: 2,
      expires_at: expiresAt
    })
    .select();

  console.log('Insert Result:');
  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert succeeded! Created lock:', data);
    
    // Clean up
    const { error: delError } = await supabase
      .from('slot_locks')
      .delete()
      .eq('id', data[0].id);
    if (delError) {
      console.error('Cleanup delete failed:', delError);
    } else {
      console.log('Cleanup delete succeeded!');
    }
  }
}

run();
