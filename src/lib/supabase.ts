import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient>;

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.includes('your-project-url') || 
      !supabaseKey || supabaseKey === 'your-anon-key') {
    throw new Error(
      'Please click the "Connect to Supabase" button in the top right to set up your Supabase project.'
    );
  }

  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Supabase client creation error:', error);
  // Create a mock client that throws the error for any operation
  supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get: () => () => {
      throw error;
    }
  });
}

export { supabase };
