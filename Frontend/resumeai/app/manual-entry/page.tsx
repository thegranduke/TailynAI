"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveManualEntry } from "@/lib/saveManualEntry";
import { useUser } from "@clerk/nextjs";

export default function ManualEntryPage() {
  // In-memory state for demo
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useUser();

  // Project handlers
  const addProject = () => setProjects([...projects, { name: "", description: "" }]);
  const updateProject = (idx: number, field: string, value: string) => setProjects(projects.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  const removeProject = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));

  // Skill handlers
  const addSkill = () => setSkills([...skills, ""]);
  const updateSkill = (idx: number, value: string) => setSkills(skills.map((s, i) => i === idx ? value : s));
  const removeSkill = (idx: number) => setSkills(skills.filter((_, i) => i !== idx));

  // Education handlers
  const addEducation = () => setEducations([...educations, { institution: "", degree: "", year: "" }]);
  const updateEducation = (idx: number, field: string, value: string) => setEducations(educations.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeEducation = (idx: number) => setEducations(educations.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    setSuccess(false);
    try {
      await saveManualEntry(user.id, { projects, skills, educations });
      setSuccess(true);
      setProjects([]);
      setSkills([]);
      setEducations([]);
    } catch (e) {
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#FCF9F4]">
      <div className="w-full max-w-2xl flex flex-col gap-8 relative">
        <div className="absolute right-0 top-0 mt-2 mr-2">
          <a href="/dashboard">
            <Button variant="ghost" className="px-4 py-2 text-sm font-medium">Dashboard</Button>
          </a>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Manually Add Experience</h1>
        {/* Projects */}
        <Card className="p-6 flex flex-col gap-4 border border-[#ece7df] bg-white shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Button variant="outline" size="sm" onClick={addProject}>+ Add Project</Button>
          </div>
          {projects.length === 0 && <div className="text-gray-400 text-sm">No projects added yet.</div>}
          {projects.map((project, idx) => (
            <div key={idx} className="flex flex-col gap-2 border-b border-[#ece7df] pb-2 mb-2">
              <input
                className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={project.name}
                placeholder="Project Name"
                onChange={e => updateProject(idx, "name", e.target.value)}
              />
              <Textarea
                className="resize-y border border-[#ece7df] bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={project.description}
                rows={2}
                placeholder="Description"
                onChange={e => updateProject(idx, "description", e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeProject(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </Card>
        {/* Skills */}
        <Card className="p-6 flex flex-col gap-4 border border-[#ece7df] bg-white shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Skills</h2>
            <Button variant="outline" size="sm" onClick={addSkill}>+ Add Skill</Button>
          </div>
          {skills.length === 0 && <div className="text-gray-400 text-sm">No skills added yet.</div>}
          {skills.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-2 border-b border-[#ece7df] pb-2 mb-2">
              <input
                className="border border-[#ece7df] rounded p-2 flex-1 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={skill}
                placeholder="Skill Name"
                onChange={e => updateSkill(idx, e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeSkill(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </Card>
        {/* Education */}
        <Card className="p-6 flex flex-col gap-4 border border-[#ece7df] bg-white shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Education</h2>
            <Button variant="outline" size="sm" onClick={addEducation}>+ Add Education</Button>
          </div>
          {educations.length === 0 && <div className="text-gray-400 text-sm">No education added yet.</div>}
          {educations.map((edu, idx) => (
            <div key={idx} className="flex flex-col gap-2 border-b border-[#ece7df] pb-2 mb-2">
              <input
                className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={edu.institution}
                placeholder="Institution"
                onChange={e => updateEducation(idx, "institution", e.target.value)}
              />
              <input
                className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={edu.degree}
                placeholder="Degree"
                onChange={e => updateEducation(idx, "degree", e.target.value)}
              />
              <input
                className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                value={edu.year}
                placeholder="Year"
                onChange={e => updateEducation(idx, "year", e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeEducation(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </Card>
        <div className="flex flex-col items-center gap-2">
          <Button onClick={handleSave} className="w-full max-w-xs bg-[#D96E36] hover:bg-[#D96E36]/90" disabled={loading}>
            {loading ? "Saving..." : "Save All"}
          </Button>
          {success && <div className="text-green-600 text-sm mt-1">Saved successfully!</div>}
        </div>
      </div>
    </main>
  );
} 