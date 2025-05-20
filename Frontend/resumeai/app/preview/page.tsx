"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import EditableSidebar from "@/components/EditableSidebar";
import ResumePreview from "@/components/ResumePreview";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PreviewPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selected = localStorage.getItem("selected_ids");
    if (!selected) return;
    const { project_ids, experience_ids, skill_ids } = JSON.parse(selected);
    async function fetchData() {
      setLoading(true);
      const [projRes, expRes, skillRes] = await Promise.all([
        supabase.from("projects").select("*").in("id", project_ids),
        supabase.from("work_experiences").select("*\n").in("id", experience_ids),
        supabase.from("skills").select("*\n").in("id", skill_ids),
      ]);
      setProjects(projRes.data || []);
      setExperiences(expRes.data || []);
      setSkills(skillRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen bg-background">
      <div className="w-full max-w-xs border-r">
        <EditableSidebar
          projects={projects}
          experiences={experiences}
          skills={skills}
          loading={loading}
        />
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <ResumePreview
          projects={projects}
          experiences={experiences}
          skills={skills}
          loading={loading}
        />
      </div>
    </main>
  );
} 