import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveManualEntry(user_id: string, { projects, skills, educations }: { projects: any[], skills: string[], educations: any[] }) {
  // Upsert projects
  if (projects.length > 0) {
    await supabase.from('projects').upsert(
      projects.map(p => ({ ...p, profile_id: user_id })),
      { onConflict: 'profile_id,name,description' }
    );
  }
  // Upsert skills
  if (skills.length > 0) {
    await supabase.from('skills').upsert(
      skills.map(name => ({ name, profile_id: user_id })),
      { onConflict: 'profile_id,name' }
    );
  }
  // Upsert education
  if (educations.length > 0) {
    await supabase.from('education').upsert(
      educations.map(e => ({ ...e, profile_id: user_id })),
      { onConflict: 'profile_id,degree,institution,year' }
    );
  }
} 