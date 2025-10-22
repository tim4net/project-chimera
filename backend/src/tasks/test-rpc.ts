import { supabaseServiceClient } from '../services/supabaseClient';

async function test() {
  try {
    console.log('Testing fetch_and_lock_job RPC...');
    
    const result = await supabaseServiceClient.rpc('fetch_and_lock_job');
    console.log('Result:', result);
    
  } catch (err: any) {
    console.error('Error:', err);
  }
  process.exit(0);
}

test();
