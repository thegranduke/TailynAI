import { createClient } from '@supabase/supabase-js';
import { matchJobToProfile } from './gemini';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface JobMatch {
  job_id: string;
  matched_skill_ids: string[];
  matched_project_ids: string[];
  matched_experience_ids: string[];
  improved_descriptions: Record<string, string>;
}

interface SkillMatch {
  job_id: string;
  skill_id: string;
}

interface ProjectMatch {
  job_id: string;
  project_id: string;
  improved_description?: string;
}

interface ExperienceMatch {
  job_id: string;
  experience_id: string;
  improved_description?: string;
}

async function insertMatch<T>(
  table: 'job_matches' | 'project_matches' | 'experience_matches',
  match: T
): Promise<void> {
  try {
    await supabase.from(table).insert(match);
  } catch (error) {
    if (error instanceof Error && !error.message.includes('duplicate key')) {
      throw error;
    }
  }
}

export async function createAndMatchJob(
  userId: string,
  title: string,
  company: string,
  jobDescription: string | null
): Promise<{ id: string; matches?: JobMatch }> {
  try {
    // 1. Create job in Supabase
    const { data: job, error: jobError } = await supabase
      .from('job_descriptions')
      .insert({
        profile_id: userId,
        title: title.trim(),
        company: company.trim(),
        raw_description: jobDescription?.trim() || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // If no job description, return early
    if (!jobDescription) {
      return { id: job.id };
    }

    // 2. Fetch user profile for matching
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        skills:skills(*),
        projects:projects(*),
        experiences:work_experiences(*)
      `)
      .eq('clerk_user_id', userId)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    // 3. Match job with Gemini
    const geminiResponse = await matchJobToProfile(profile, jobDescription);

    // 4. Update job with Gemini's analysis
    await supabase
      .from('job_descriptions')
      .update({
        title: geminiResponse.job_title || title,
        company: geminiResponse.job_company || company,
        raw_description: geminiResponse.job_raw_description || jobDescription
      })
      .eq('id', job.id)
      .eq('profile_id', userId);

    // 5. Create matches in parallel
    const matchPromises = [
      // Skills matches
      ...geminiResponse.matched_skill_ids.map((skillId: string) => {
        const match: SkillMatch = { job_id: job.id, skill_id: skillId };
        return insertMatch('job_matches', match);
      }),
      // Project matches
      ...geminiResponse.matched_project_ids.map((projectId: string) => {
        const match: ProjectMatch = {
          job_id: job.id,
          project_id: projectId,
          improved_description: geminiResponse.improved_descriptions[projectId]
        };
        return insertMatch('project_matches', match);
      }),
      // Experience matches
      ...geminiResponse.matched_experience_ids.map((expId: string) => {
        const match: ExperienceMatch = {
          job_id: job.id,
          experience_id: expId,
          improved_description: geminiResponse.improved_descriptions[expId]
        };
        return insertMatch('experience_matches', match);
      })
    ];

    await Promise.all(matchPromises);

    return {
      id: job.id,
      matches: {
        job_id: job.id,
        matched_skill_ids: geminiResponse.matched_skill_ids,
        matched_project_ids: geminiResponse.matched_project_ids,
        matched_experience_ids: geminiResponse.matched_experience_ids,
        improved_descriptions: geminiResponse.improved_descriptions
      }
    };
  } catch (error) {
    console.error('Error in createAndMatchJob:', error);
    throw error;
  }
} 