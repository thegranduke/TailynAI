import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, company, jobDescription } = body;

    if (!title?.trim() || !company?.trim()) {
      return new NextResponse('Title and company are required', { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create a new job with all fields
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error creating job:', error);
      return new NextResponse('Failed to create job', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 