import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchDashboardJobs(user_id: string) {
  const { data, error } = await supabase
    .from('job_descriptions')
    .select('id, title, company, created_at')
    .eq('profile_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
} 