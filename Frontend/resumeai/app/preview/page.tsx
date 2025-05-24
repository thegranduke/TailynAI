"use client";
import { useEffect, useState } from "react";
import ResumePreview from "@/components/ResumePreview";
import { useResumeStore } from "@/store/useResumeStore";
import { fetchResumeData } from "@/lib/fetchResumeData";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import EditableSidebar from "@/components/EditableSidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const setPersonal = useResumeStore(s => s.setPersonal);
  const setSkills = useResumeStore(s => s.setSkills);
  const setExperiences = useResumeStore(s => s.setExperiences);
  const setProjects = useResumeStore(s => s.setProjects);

  const { user } = useUser();
  const searchParams = useSearchParams();
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const job_id = searchParams.get("job_id");
    console.log("user?.id:", user?.id, "job_id:", job_id);
    if (!user?.id || !job_id) return;
    setLoading(true);
    setError(null);
    fetchResumeData(user.id, job_id)
      .then(data => {
        console.log("Resume data:", data);
        setPersonal(data.personal);
        setSkills(data.skills);
        setExperiences(data.experiences);
        setProjects(data.projects);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load resume data. " + (err?.message || ""));
        setLoading(false);
      });
  }, [user?.id, searchParams]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-x-hidden bg-[#f9f6f1]">
        {/* Sidebar width is set here: */}
        <Sidebar className="w-1/3 min-w-[260px] max-w-md bg-[#FDF9F4] h-full p-6 border-r border-[#e6e1d9] flex flex-col">
          <SidebarContent className="flex-1 flex flex-col gap-8">
            <EditableSidebar loading={loading} hideGoToDashboard />
          </SidebarContent>
          <SidebarFooter className="mt-auto pt-4">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button className="w-full bg-[#D96E36] hover:bg-[#D96E36]/80">Go to Dashboard</Button>
            </Link>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col items-center justify-start min-h-screen">
          <div className="flex-1 w-full max-w-2xl mx-auto mb-8">
            {error ? (
              <div className="text-red-500 p-8 ">{error}</div>
            ) : (
              <ResumePreview />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 