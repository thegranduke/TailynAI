import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("job_pdf");
  const jobText = formData.get("job_text");
  const clerkUserId = formData.get("clerk_user_id");
  if (!file && !jobText) {
    return NextResponse.json({ error: "No file or text provided" }, { status: 400 });
  }

  const backendForm = new FormData();
  if (file && typeof file !== "string") {
    backendForm.append("job_pdf", file);
  }
  if (jobText && typeof jobText === "string" && jobText.trim()) {
    backendForm.append("job_text", jobText.trim());
  }
  if (clerkUserId && typeof clerkUserId === "string") {
    backendForm.append("clerk_user_id", clerkUserId);
  }

  const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/match-job";

  const token = req.headers.get("authorization");

  try {
    const flaskRes = await fetch(FLASK_URL, {
      method: "POST",
      body: backendForm,
      headers: token ? { Authorization: token } : undefined,
    });
    if (!flaskRes.ok) {
      return NextResponse.json({ error: "Flask upload failed" }, { status: 500 });
    }
    const data = await flaskRes.json();
    // Expecting { project_ids, experience_ids, skill_ids }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 