import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper headers
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

interface SkillMatch {
  skills: {
    id: number;
    name: string;
  };
}

interface ProjectMatch {
  projects: {
    id: number;
    name: string;
    description: string;
    link: string | null;
  };
  improved_description: string | null;
}

interface ExperienceMatch {
  work_experiences: {
    id: number;
    position: string;
    company: string;
    duration: string;
    description: string;
  };
  improved_description: string | null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Debug: Starting GET request for job matches');
    
    const session = await auth();
    if (!session?.userId) {
      console.log('Debug: Unauthorized - no session.userId');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const jobId = parseInt(id);
    if (!jobId) {
      console.log('Debug: Invalid job ID:', id);
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    console.log('Debug: Fetching job for ID:', jobId, 'and user:', session.userId);

    // Get the job to verify ownership
    const { data: job, error: jobError } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', jobId)
      .eq('profile_id', session.userId)
      .single();

    if (jobError) {
      console.error('Debug: Error fetching job:', jobError);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job) {
      console.log('Debug: No job found for ID:', jobId);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log('Debug: Fetching matches for job:', jobId);

    // Get all matches for this job
    const [skillMatches, projectMatches, experienceMatches] = await Promise.all([
      // Get skill matches
      supabase
        .from('job_matches')
        .select(`
          skill_id,
          skills (
            id,
            name
          )
        `)
        .eq('job_id', jobId),
      
      // Get project matches with improved descriptions
      supabase
        .from('project_matches')
        .select(`
          project_id,
          improved_description,
          projects (
            id,
            name,
            description,
            link
          )
        `)
        .eq('job_id', jobId),
      
      // Get experience matches with improved descriptions
      supabase
        .from('experience_matches')
        .select(`
          experience_id,
          improved_description,
          work_experiences (
            id,
            position,
            company,
            duration,
            description
          )
        `)
        .eq('job_id', jobId)
    ]);

    console.log('Debug: Raw database query results:', {
      skillMatches: {
        data: skillMatches.data,
        error: skillMatches.error
      },
      projectMatches: {
        data: projectMatches.data,
        error: projectMatches.error
      },
      experienceMatches: {
        data: experienceMatches.data,
        error: experienceMatches.error
      }
    });

    console.log('Debug: Match results:', {
      skillMatches: skillMatches.data,
      projectMatches: projectMatches.data,
      experienceMatches: experienceMatches.data
    });

    // Format the response to match what the preview page expects
    const response = {
      skills: ((skillMatches.data as unknown) as SkillMatch[] || []).map(match => ({
        id: match.skills.id,
        name: match.skills.name
      })),
      projects: ((projectMatches.data as unknown) as ProjectMatch[] || []).map(match => ({
        id: match.projects.id,
        name: match.projects.name,
        description: match.improved_description || match.projects.description,
        link: match.projects.link
      })),
      experiences: ((experienceMatches.data as unknown) as ExperienceMatch[] || []).map(match => ({
        id: match.work_experiences.id,
        position: match.work_experiences.position,
        company: match.work_experiences.company,
        duration: match.work_experiences.duration,
        description: match.improved_description || match.work_experiences.description
      }))
    };

    console.log('Debug: Formatted response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Debug: Error in GET /api/jobs/[id]/matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 