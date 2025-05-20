"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
// If shadcn/ui Button is not available, fallback to a native button
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export default function UploadResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { getToken, userId } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a PDF file.");
      setLoading(false);
      return;
    }
    formData.append("resume", file);
    try {
      const token = await getToken();
      console.log("Clerk token:", token); // For testing
      console.log("Clerk userId:", userId); // For testing
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        router.push("/upload-job");
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4 text-center">Upload Your Resume (PDF)</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              className="border rounded p-2"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload Resume"}
            </Button>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </form>
        </Card>
      </div>
    </main>
  );
} 