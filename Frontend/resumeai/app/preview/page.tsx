"use client";
import { useEffect, useState } from "react";
import PaneLayout from "@/components/PaneLayout";
import EditableSidebar from "@/components/EditableSidebar";
import ResumePreview from "@/components/ResumePreview";
import { useResumeStore } from "@/store/useResumeStore";
import { fetchResumeData } from "@/lib/fetchResumeData";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

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
    <PaneLayout
      left={<EditableSidebar loading={loading} />}
      right={
        error ? (
          <div className="text-red-500 p-8 ">{error}</div>
        ) : (
          <ResumePreview />
        )
      }
    />
  );
} 