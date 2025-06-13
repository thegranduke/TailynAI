"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function UploadJobPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobText, setJobText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!jobText.trim()) {
      setError("Please paste the job description.");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "New Job", // Default title, can be updated later
          company: "Company", // Default company, can be updated later
          description: jobText.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create job");
      }

      const { id: jobId, matches } = await res.json();

      // If we have matches, store them for the preview page
      if (matches) {
        localStorage.setItem(
          "selected_ids",
          JSON.stringify({
            project_ids: matches.matched_project_ids,
            experience_ids: matches.matched_experience_ids,
            skill_ids: matches.matched_skill_ids
          })
        );
      }

      router.push(`/preview?job_id=${jobId}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#FCF9F4]">
      <div className="w-full max-w-md">
        <Card className="p-6 flex flex-col gap-4 border border-[#ece7df] bg-white shadow-none">
          <h2 className="text-xl font-semibold mb-4 text-center">Paste Job Description</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              value={jobText}
              onChange={e => setJobText(e.target.value)}
              placeholder="Paste job description here..."
              rows={6}
              className="resize-y border border-[#ece7df] bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
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