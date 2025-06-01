import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("Auth failed: No userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both JSON and FormData
    let jobDescription: string;
    let jobId: string;

    if (req.headers.get("content-type")?.includes("application/json")) {
      const jsonData = await req.json();
      jobDescription = jsonData.job_description;
      jobId = jsonData.job_id;
      console.log("Received JSON request:", { jobId, descriptionLength: jobDescription?.length });
    } else {
      const formData = await req.formData();
      jobDescription = formData.get("job_text") as string;
      jobId = formData.get("job_id") as string;
      console.log("Received FormData request:", { jobId, descriptionLength: jobDescription?.length });
    }

    if (!jobDescription) {
      console.error("Validation failed: No job description");
      return NextResponse.json({ error: "No job description provided" }, { status: 400 });
    }

    if (!jobId) {
      console.error("Validation failed: No job ID");
      return NextResponse.json({ error: "No job ID provided" }, { status: 400 });
    }

    const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/match-job";
    const token = req.headers.get("Authorization");
    console.log("Token:", token);

    console.log("Sending request to Flask:", {
      url: FLASK_URL,
      hasToken: !!token,
      jobId,
      userId
    });

    const response = await fetch(FLASK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {})
      },
      body: JSON.stringify({
        job_description: jobDescription,
        job_id: jobId,
        clerk_user_id: userId
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      console.error("Flask request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: `Flask request failed: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Flask request successful:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in match-job route:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 