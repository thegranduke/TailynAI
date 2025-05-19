import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("resume");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Prepare FormData for Flask backend
  const backendForm = new FormData();
  backendForm.append("resume", file);

  // Change this to your Flask backend URL
  const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/upload";

  try {
    const flaskRes = await fetch(FLASK_URL, {
      method: "POST",
      body: backendForm,
    });
    if (!flaskRes.ok) {
      return NextResponse.json({ error: "Flask upload failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 