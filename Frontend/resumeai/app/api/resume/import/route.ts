import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authObject = await auth();
    if (!authObject.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const resume = formData.get("resume") as File;
    if (!resume) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    // Create a new FormData instance for the backend request
    const backendFormData = new FormData();
    backendFormData.append("resume", resume);

    // Forward the request to the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
      method: "POST",
      body: backendFormData,
      headers: {
        "Authorization": `Bearer ${await authObject.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to process resume" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Resume processed successfully" });
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 