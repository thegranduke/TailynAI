import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // TODO: Add actual resume parsing logic here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a new job entry
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('job_descriptions')
      .insert([
        {
          profile_id: userId,
          title: 'Imported Resume',
          company: 'Previous Company',
          raw_description: 'Imported from PDF'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return new NextResponse('Failed to create job', { status: 500 });
    }

    return NextResponse.json({ job_id: data.id });
  } catch (error) {
    console.error('Error in POST /api/resume/import:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 