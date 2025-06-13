import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAndMatchJob } from '@/lib/jobs';
import { supabase } from '@/lib/supabase';
import { matchJobToProfile } from '@/lib/gemini';

interface ProjectMatch {
  project_id: number;
  improved_description: string;
}

interface ExperienceMatch {
  experience_id: number;
  improved_description: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, company, description } = await req.json();
    if (!title || !company) {
      return NextResponse.json({ error: "Title and company are required" }, { status: 400 });
    }

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('job_descriptions')
      .insert([{
        profile_id: session.userId,
        title,
        company,
        raw_description: description || null
      }])
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // If there's a description, create matches
    if (description) {
      // Get user's profile data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', session.userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
      }

      // Get user's skills
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', session.userId);

      if (skillsError) {
        console.error('Error fetching skills:', skillsError);
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
      }

      // Get user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', session.userId);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
      }

      // Get user's experiences
      const { data: experiences, error: experiencesError } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('profile_id', session.userId);

      if (experiencesError) {
        console.error('Error fetching experiences:', experiencesError);
        return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
      }

      // Get matches from Gemini
      console.log('Debug: Calling Gemini with profile data:', {
        skillsCount: skills?.length,
        projectsCount: projects?.length,
        experiencesCount: experiences?.length,
        description: description
      });

      const matches = await matchJobToProfile({
        skills,
        projects,
        experiences
      }, description);

      console.log('Debug: Received matches from Gemini:', matches);

      // Create matches for each skill
      if (matches?.matched_skill_ids?.length > 0) {
        const skillMatches = matches.matched_skill_ids.map((skillId: number) => ({
          job_id: job.id,
          skill_id: skillId
        }));
        console.log('Debug: Creating skill matches:', skillMatches);
        const { error: skillMatchesError } = await supabase
          .from('job_matches')
          .insert(skillMatches);
        if (skillMatchesError) {
          console.error('Error creating skill matches:', skillMatchesError);
          return NextResponse.json({ error: 'Failed to create skill matches' }, { status: 500 });
        }
        console.log('Debug: Successfully created skill matches');
      }

      // Create project matches with improved descriptions
      if (matches?.matched_project_ids?.length > 0) {
        const projectMatches = matches.matched_project_ids.map((projectId: number) => ({
          job_id: job.id,
          project_id: projectId,
          improved_description: matches.improved_descriptions[projectId.toString()]
        }));
        console.log('Debug: Creating project matches:', projectMatches);
        const { error: projectMatchesError } = await supabase
          .from('project_matches')
          .insert(projectMatches);
        if (projectMatchesError) {
          console.error('Error creating project matches:', projectMatchesError);
          return NextResponse.json({ error: 'Failed to create project matches' }, { status: 500 });
        }
        console.log('Debug: Successfully created project matches');
      }

      // Create experience matches with improved descriptions
      if (matches?.matched_experience_ids?.length > 0) {
        const experienceMatches = matches.matched_experience_ids.map((experienceId: number) => ({
          job_id: job.id,
          experience_id: experienceId,
          improved_description: matches.improved_descriptions[experienceId.toString()]
        }));
        console.log('Debug: Creating experience matches:', experienceMatches);
        const { error: experienceMatchesError } = await supabase
          .from('experience_matches')
          .insert(experienceMatches);
        if (experienceMatchesError) {
          console.error('Error creating experience matches:', experienceMatchesError);
          return NextResponse.json({ error: 'Failed to create experience matches' }, { status: 500 });
        }
        console.log('Debug: Successfully created experience matches');
      } else {
        console.log('Debug: No experience matches to create');
      }
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 