import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchResumeData(user_id: string, job_id: string) {
  // Fetch all data in parallel using correct linkage columns
  const [profileRes, skillsRes, projectsRes, expRes, projMatchRes, expMatchRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('clerk_user_id', user_id).single(),
    supabase.from('skills').select('*').eq('profile_id', user_id),
    supabase.from('projects').select('*').eq('profile_id', user_id),
    supabase.from('work_experiences').select('*').eq('profile_id', user_id),
    supabase.from('project_matches').select('*').eq('job_id', job_id),
    supabase.from('experience_matches').select('*').eq('job_id', job_id),
  ]);

  // Map matches to full objects (if needed)
  const matchedProjectIds = projMatchRes.data?.map((m: any) => m.project_id) || [];
  const matchedExperienceIds = expMatchRes.data?.map((m: any) => m.experience_id) || [];

  return {
    personal: profileRes.data || {},
    skills: skillsRes.data || [],
    projects: projectsRes.data?.filter((p: any) => matchedProjectIds.length === 0 || matchedProjectIds.includes(p.id)) || [],
    experiences: expRes.data?.filter((e: any) => matchedExperienceIds.length === 0 || matchedExperienceIds.includes(e.id)) || [],
  };
} 