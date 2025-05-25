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
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PreviewPage() {
  const setPersonal = useResumeStore(s => s.setPersonal);
  const setSkills = useResumeStore(s => s.setSkills);
  const setExperiences = useResumeStore(s => s.setExperiences);
  const setProjects = useResumeStore(s => s.setProjects);
  const setEducation = useResumeStore(s => s.setEducation);

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
        setEducation(data.education);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load resume data. " + (err?.message || ""));
        setLoading(false);
      });
  }, [user?.id, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F4] w-full">
      <Header />
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-x-hidden">
          {/* Sidebar width is set here: */}
          <Sidebar className="w-1/3 min-w-[260px] max-w-md bg-[#FDF9F4] h-full border-r border-[#e6e1d9] flex flex-col">
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
            <div className="flex-1 w-full max-w-4xl mx-auto mb-8">
              {error ? (
                <div className="text-red-500 p-8 ">{error}</div>
              ) : (
                <ResumePreview />
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
} 