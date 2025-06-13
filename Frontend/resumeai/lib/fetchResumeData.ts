import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false // Since we're using Clerk for auth
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    }
  }
);

export async function fetchResumeData(user_id: string, job_id: string) {
  try {
    console.log('Fetching resume data for user:', user_id, 'job:', job_id);
    
    if (!user_id || !job_id) {
      throw new Error('Missing required parameters: user_id or job_id');
    }

    // Fetch all data in parallel using correct linkage columns
    const [profileRes, resumeStateRes, jobRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('clerk_user_id', user_id).single(),
      supabase.from('resume_states').select('*').eq('job_id', job_id).eq('profile_id', user_id).single(),
      supabase.from('job_descriptions').select('*').eq('id', job_id).single()
    ]);

    // Check for errors in each response
    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileRes.error);
      throw profileRes.error;
    }

    if (resumeStateRes.error && resumeStateRes.error.code !== 'PGRST116') {
      console.error('Error fetching resume state:', resumeStateRes.error);
      throw resumeStateRes.error;
    }

    if (jobRes.error && jobRes.error.code !== 'PGRST116') {
      console.error('Error fetching job:', jobRes.error);
      throw jobRes.error;
    }

    // If we have a saved state, use it directly
    if (resumeStateRes.data) {
      console.log('Found saved resume state:', resumeStateRes.data);
      const savedState = resumeStateRes.data;

      // Use saved personal info, falling back to profile data and job data
      const personal = {
        ...(profileRes.data || {}),
        ...savedState.personal,
        title: jobRes.data?.title,
        company: jobRes.data?.company
      };

      const result = {
        personal,
        skills: savedState.skills || [],
        experiences: savedState.experiences || [],
        projects: savedState.projects || [],
        education: savedState.education || []
      };

      console.log('Returning resume data:', result);
      return result;
    }

    console.log('No saved state found, returning empty sections');
    // If no saved state exists, return empty sections with basic info
    return {
      personal: {
        ...(profileRes.data || {}),
        title: jobRes.data?.title,
        company: jobRes.data?.company
      },
      skills: [],
      experiences: [],
      projects: [],
      education: []
    };
  } catch (error) {
    console.error('Error fetching resume data:', error);
    throw error;
  }
}

export async function fetchEducation(user_id: string) {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('profile_id', user_id)
    .order('year', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProjects(user_id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', user_id)
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchExperiences(user_id: string) {
  const { data, error } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('profile_id', user_id)
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchSkills(user_id: string) {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('profile_id', user_id)
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
} 