"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";

export default function UploadJobPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobText, setJobText] = useState("");
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
    if (!file && !jobText.trim()) {
      setError("Please upload a PDF or paste the job description.");
      setLoading(false);
      return;
    }
    if (file) {
      formData.append("job_pdf", file);
    }
    if (jobText.trim()) {
      formData.append("job_text", jobText.trim());
    }
    if (userId) {
      formData.append("clerk_user_id", userId);
    }
    try {
      const token = await getToken();
      const res = await fetch("/api/match-job", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        const { project_ids, experience_ids, skill_ids, job_id } = data;
        localStorage.setItem(
          "selected_ids",
          JSON.stringify({ project_ids, experience_ids, skill_ids })
        );
        if (job_id) {
          router.push(`/preview?job_id=${job_id}`);
        } else {
          router.push("/preview");
        }
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
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#FCF9F4]">
      <div className="w-full max-w-md">
        <Card className="p-6 flex flex-col gap-4 border border-[#ece7df] bg-white shadow-none">
          <h2 className="text-xl font-semibold mb-4 text-center">Upload or Paste Job Description</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
              disabled={!!jobText.trim()}
            />
            <div className="text-center text-gray-500 text-xs">or</div>
            <Textarea
              value={jobText}
              onChange={e => setJobText(e.target.value)}
              placeholder="Paste job description here..."
              rows={6}
              className="resize-y border border-[#ece7df] bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
              disabled={!!fileInputRef.current?.files?.length}
            />
            <Button type="submit" disabled={loading} className="w-full bg-[#D96E36] hover:bg-[#D96E36]/90">
              {loading ? "Submitting..." : "Submit"}
            </Button>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </form>
          <Button variant="outline" className="w-full" onClick={() => router.push('/manual-entry')}>
            Manually Add Experience
          </Button>
        </Card>
      </div>
    </main>
  );
} 