import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddtljimgeycveymaousq.supabase.co';
const supabaseKey = 'sb_publishable_6QdBhUvgaKa_AGn2af4OAQ_TXvZEDUw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing SignUp...');
  const res1 = await supabase.auth.signUp({
    email: 'admin@nirosha.lk',
    password: 'admin123',
    options: {
        data: { full_name: 'Client Admin' }
    }
  });
  console.log('SignUp Admin Result:', res1.error ? res1.error.message : 'Success');

  const res2 = await supabase.auth.signUp({
    email: 'passenger@nirosha.lk',
    password: 'passenger123',
    options: {
        data: { full_name: 'Client Passenger' }
    }
  });
  console.log('SignUp Passenger Result:', res2.error ? res2.error.message : 'Success');

  const resTest = await supabase.auth.signUp({
    email: 'test@admin.lk',
    password: 'temp01',
    options: {
        data: { full_name: 'Test Admin' }
    }
  });
  console.log('SignUp Test Admin Result:', resTest.error ? resTest.error.message : 'Success');

  console.log('Testing SignIn Admin...');
  const res3 = await supabase.auth.signInWithPassword({
    email: 'admin@nirosha.lk',
    password: 'admin123'
  });
  console.log('SignIn Admin Result:', res3.error ? res3.error.message : 'Success');
  
  if (res3.data && res3.data.user) {
    const { data, error } = await supabase.rpc('is_admin');
    console.log('is_admin RPC Error:', error ? error.message : 'Success');
    console.log('is_admin RPC Data:', data);
  }
}

test();
