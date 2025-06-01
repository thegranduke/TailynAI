import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { personal, skills, experiences, projects, education } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update job description
    const { data, error } = await supabase
      .from('job_descriptions')
      .update({
        title: personal?.title || null,
        company: personal?.company || null,
        raw_description: personal?.description || null,
      })
      .eq('id', params.id)
      .eq('profile_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return new NextResponse('Failed to update job', { status: 500 });
    }

    // Update matches
    if (skills?.length > 0) {
      // Delete existing matches
      await supabase
        .from('job_matches')
        .delete()
        .eq('job_id', params.id);

      // Insert new matches
      await supabase
        .from('job_matches')
        .insert(
          skills.map((skill: any) => ({
            job_id: params.id,
            skill_id: skill.id,
          }))
        );
    }

    if (projects?.length > 0) {
      // Delete existing matches
      await supabase
        .from('project_matches')
        .delete()
        .eq('job_id', params.id);

      // Insert new matches
      await supabase
        .from('project_matches')
        .insert(
          projects.map((project: any) => ({
            job_id: params.id,
            project_id: project.id,
            improved_description: project.description,
          }))
        );
    }

    if (experiences?.length > 0) {
      // Delete existing matches
      await supabase
        .from('experience_matches')
        .delete()
        .eq('job_id', params.id);

      // Insert new matches
      await supabase
        .from('experience_matches')
        .insert(
          experiences.map((exp: any) => ({
            job_id: params.id,
            experience_id: exp.id,
            improved_description: exp.description,
          }))
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/jobs/[id]:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 