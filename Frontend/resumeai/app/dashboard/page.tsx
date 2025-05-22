"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { fetchDashboardJobs } from "@/lib/fetchDashboardJobs";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
  { label: "Resumes", href: "#" },
  { label: "Saved Matches", href: "#" },
  { label: "Settings", href: "#" },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60 * 60) return `${Math.floor(diff / 60) || 1} min ago`;
  if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    fetchDashboardJobs(user.id)
      .then(setJobs)
      .catch(e => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-[#f9f6f1]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#ece7df] flex flex-col py-8 px-6">
        <div className="text-2xl font-bold mb-8 tracking-tight">ResumeAI</div>
        <nav className="flex flex-col gap-4 flex-1">
          {sidebarLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-base text-gray-700 hover:text-[#D96E36] transition font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto">
          <Button className="w-full bg-[#D96E36] hover:bg-[#D96E36]/80">Log out</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col items-center">
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex-shrink-0">Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button className="bg-[#D96E36] hover:bg-[#D96E36]/80 w-full sm:w-auto">Upload Resume</Button>
              <Button variant="outline" className="w-full sm:w-auto">Upload Job Description</Button>
              <Button variant="outline" className="w-full sm:w-auto">Add Projects/Experience/Skills</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin w-6 h-6 text-[#D96E36]" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : jobs.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No jobs found. Upload a job description to get started!</Card>
          ) : (
            jobs.map(job => (
              <Card key={job.id} className="flex flex-col md:flex-row md:items-center justify-between border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-gray-900">{job.title}</span>
                    {job.company && <span className="text-gray-600 text-base font-medium">- {job.company}</span>}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{formatDate(job.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
                  <Link href={`/preview?job_id=${job.id}`} passHref legacyBehavior>
                    <Button variant="outline" className="border-[#D96E36] text-[#D96E36] hover:bg-[#D96E36]/10 w-full sm:w-auto">Preview</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
} 