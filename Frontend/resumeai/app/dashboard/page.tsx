"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { fetchDashboardJobs } from "@/lib/fetchDashboardJobs";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { fetchProjects, fetchExperiences, fetchEducation, fetchSkills } from "@/lib/fetchResumeData";
import ResumePreview from "@/components/ResumePreview";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sidebarLinks = [
  { label: "Resumes", section: "Resumes" },
  { label: "Projects", section: "Projects" },
  { label: "Experiences", section: "Experiences" },
  { label: "Education", section: "Education" },
  { label: "Skills", section: "Skills" },
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

function SidebarAccountFooter() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SidebarFooter className="mt-auto border-t border-[#ece7df] bg-[#FFFEFB] p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full group focus:outline-none">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="font-semibold text-[#222] text-sm leading-tight truncate">{user?.fullName}</span>
              <span className="text-xs text-[#666] truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-[#D96E36] ml-2 group-hover:text-[#b85a28]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-lg border border-[#ece7df] bg-white shadow-lg min-w-[220px] p-0">
          <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-[#222] text-sm">{user?.fullName}</div>
              <div className="text-xs text-[#666]">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Account</DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Billing</DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Notifications</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="px-3 py-2 text-[#D96E36] hover:bg-[#FCF9F4] cursor-pointer"
            onClick={() => signOut()}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

function DashboardSidebar({ setActiveSection, activeSection }: { setActiveSection: (section: string) => void, activeSection: string }) {
  return (
    <Sidebar className="border-r border-[#ece7df] bg-white">
      <SidebarContent className="pt-12">
        <SidebarGroup>
          <SidebarGroupLabel>Tailyn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarLinks.map(link => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton asChild>
                    <button
                      className={`w-full text-left ${activeSection === link.section ? 'text-[#D96E36] font-bold' : ''}`}
                      onClick={() => setActiveSection(link.section)}
                    >
                      {link.label}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarAccountFooter />
    </Sidebar>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("Resumes");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [projectEdits, setProjectEdits] = useState<any>({});
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
  const [experienceEdits, setExperienceEdits] = useState<any>({});
  const [newSkill, setNewSkill] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [addingExperience, setAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({ position: '', company: '', duration: '', description: '' });
  const [expandedEducation, setExpandedEducation] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [educationEdits, setEducationEdits] = useState<any>({});
  const [addingEducation, setAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '', description: '' });
  const [deleteModal, setDeleteModal] = useState({ type: '', id: null });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchDashboardJobs(user.id),
      fetchProjects(user.id),
      fetchExperiences(user.id),
      fetchEducation(user.id),
      fetchSkills(user.id)
    ])
      .then(([jobsData, projectsData, experiencesData, educationData, skillsData]) => {
        setJobs(jobsData);
        setProjects(projectsData);
        setExperiences(experiencesData);
        setEducation(educationData);
        setSkills(skillsData);
      })
      .catch(e => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Remove skill handler
  async function handleRemoveSkill(skillId: number) {
    if (!user?.id) return;
    setSkills(skills => skills.filter(s => s.id !== skillId));
    // Remove from DB
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('skills').delete().eq('id', skillId).eq('profile_id', user.id);
  }

  // Project edit handlers
  function handleProjectEdit(id: number, field: string, value: string) {
    setProjectEdits((prev: any) => ({ ...prev, [field]: value }));
  }
  function startProjectEdit(project: any) {
    setEditingProject(project.id);
    setProjectEdits({ ...project });
  }
  function cancelProjectEdit() {
    setEditingProject(null);
    setProjectEdits({});
  }
  async function saveProjectEdit(id: number) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('projects').update(projectEdits).eq('id', id);
    setProjects(projects => projects.map(p => p.id === id ? { ...p, ...projectEdits } : p));
    setEditingProject(null);
    setProjectEdits({});
  }

  // Experience edit handlers
  function handleExperienceEdit(id: number, field: string, value: string) {
    setExperienceEdits((prev: any) => ({ ...prev, [field]: value }));
  }
  function startExperienceEdit(exp: any) {
    setEditingExperience(exp.id);
    setExperienceEdits({ ...exp });
  }
  function cancelExperienceEdit() {
    setEditingExperience(null);
    setExperienceEdits({});
  }
  async function saveExperienceEdit(id: number) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('work_experiences').update(experienceEdits).eq('id', id);
    setExperiences(experiences => experiences.map(e => e.id === id ? { ...e, ...experienceEdits } : e));
    setEditingExperience(null);
    setExperienceEdits({});
  }

  async function handleAddSkill() {
    if (!newSkill.trim() || !user?.id) return;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('skills')
      .insert([{ name: newSkill, profile_id: user.id }])
      .select();
    if (!error && data && data[0]) {
      setSkills(skills => [...skills, data[0]]);
      setNewSkill("");
    }
  }

  async function handleAddProject() {
    if (!newProject.name.trim() || !user?.id) return;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...newProject, profile_id: user.id }])
      .select();
    if (!error && data && data[0]) {
      setProjects(projects => [...projects, data[0]]);
      setNewProject({ name: '', description: '' });
      setAddingProject(false);
    }
  }

  async function handleAddExperience() {
    if (!newExperience.position.trim() || !user?.id) return;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('work_experiences')
      .insert([{ ...newExperience, profile_id: user.id }])
      .select();
    if (!error && data && data[0]) {
      setExperiences(experiences => [...experiences, data[0]]);
      setNewExperience({ position: '', company: '', duration: '', description: '' });
      setAddingExperience(false);
    }
  }

  function handleEducationEdit(id: number, field: string, value: string) {
    setEducationEdits((prev: any) => ({ ...prev, [field]: value }));
  }
  function startEducationEdit(edu: any) {
    setEditingEducation(edu.id);
    setEducationEdits({ ...edu });
  }
  function cancelEducationEdit() {
    setEditingEducation(null);
    setEducationEdits({});
  }
  async function saveEducationEdit(id: number) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('education').update(educationEdits).eq('id', id);
    setEducation(education => education.map(e => e.id === id ? { ...e, ...educationEdits } : e));
    setEditingEducation(null);
    setEducationEdits({});
  }
  async function handleAddEducation() {
    if (!newEducation.degree.trim() || !user?.id) return;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('education')
      .insert([{ ...newEducation, profile_id: user.id }])
      .select();
    if (!error && data && data[0]) {
      setEducation(education => [...education, data[0]]);
      setNewEducation({ degree: '', institution: '', year: '', description: '' });
      setAddingEducation(false);
    }
  }

  async function handleDelete(type: string, id: number) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    if (type === 'project') {
      await supabase.from('projects').delete().eq('id', id);
      setProjects(projects => projects.filter(p => p.id !== id));
    } else if (type === 'experience') {
      await supabase.from('work_experiences').delete().eq('id', id);
      setExperiences(experiences => experiences.filter(e => e.id !== id));
    } else if (type === 'education') {
      await supabase.from('education').delete().eq('id', id);
      setEducation(education => education.filter(e => e.id !== id));
    }
    setDeleteModal({ type: '', id: null });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F4] w-full">
      <Header />
      <SidebarProvider>
        <div className="flex min-h-screen w-screen overflow-x-hidden bg-[#f9f6f1]">
          <DashboardSidebar setActiveSection={setActiveSection} activeSection={activeSection} />
          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-start min-h-screen">
            <div className="w-full flex justify-start p-4">
              <SidebarTrigger />
            </div>
            <div className="w-full max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight flex-shrink-0">Dashboard</h1>
                {activeSection === "Resumes" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button className="bg-[#D96E36] hover:bg-[#D96E36]/80 w-full sm:w-auto">Upload Resume</Button>
                  <Button variant="outline" className="w-full sm:w-auto">Upload Job Description</Button>
                  <Button variant="outline" className="w-full sm:w-auto">Add Data</Button>
                </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin w-6 h-6 text-[#D96E36]" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : activeSection === "Resumes" ? (
                jobs.length === 0 ? (
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
                )
              ) : activeSection === "Projects" ? (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold mr-4">Projects</h2>
                    <Button size="sm" className="bg-[#D96E36] text-white ml-auto" onClick={() => setAddingProject(true)}>+ Add Project</Button>
                  </div>
                  {addingProject && (
                    <Card className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                      <div className="flex flex-col gap-2">
                        <input
                          className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newProject.name}
                          onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                          placeholder="Project Name"
                        />
                        <textarea
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newProject.description}
                          onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                          placeholder="Description"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-[#D96E36] text-white" onClick={handleAddProject}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => { setAddingProject(false); setNewProject({ name: '', description: '' }); }}>Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  {projects.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No projects found.</Card>
                  ) : (
                    projects.map(project => {
                      const expanded = expandedProject === project.id;
                      const editing = editingProject === project.id;
                      return (
                        <Card key={project.id} className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedProject(expanded ? null : project.id)}>
                            <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center">
                              {expanded ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
                              {project.name}
                              {project.company && <span className="text-base text-gray-600 ml-2">- {project.company}</span>}
                            </div>
                          </div>
                          {expanded && (
                            <div className="mt-2">
                              {editing ? (
                                <div className="flex flex-col gap-2">
                                  <input
                                    className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={projectEdits.name || ""}
                                    onChange={e => handleProjectEdit(project.id, "name", e.target.value)}
                                    placeholder="Project Name"
                                  />
                                  <textarea
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={projectEdits.description || ""}
                                    onChange={e => handleProjectEdit(project.id, "description", e.target.value)}
                                    placeholder="Description"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => saveProjectEdit(project.id)}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={cancelProjectEdit}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-base mb-1 bg-[#FCF9F4] rounded p-2">{project.name}</div>
                                  {project.company && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{project.company}</div>}
                                  {project.duration && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{project.duration}</div>}
                                  <div className="bg-[#FCF9F4] rounded p-2 mb-1 whitespace-pre-line">{project.description}</div>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => startProjectEdit(project)}>Edit</Button>
                                    <Button size="sm" className="bg-[#6B3F1D] text-white" onClick={() => setDeleteModal({ type: 'project', id: project.id })}>Delete</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              ) : activeSection === "Experiences" ? (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold mr-4">Experiences</h2>
                    <Button size="sm" className="bg-[#D96E36] text-white ml-auto" onClick={() => setAddingExperience(true)}>+ Add Experience</Button>
                  </div>
                  {addingExperience && (
                    <Card className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                      <div className="flex flex-col gap-2">
                        <input
                          className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newExperience.position}
                          onChange={e => setNewExperience(exp => ({ ...exp, position: e.target.value }))}
                          placeholder="Position"
                        />
                        <input
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newExperience.company}
                          onChange={e => setNewExperience(exp => ({ ...exp, company: e.target.value }))}
                          placeholder="Company"
                        />
                        <input
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newExperience.duration}
                          onChange={e => setNewExperience(exp => ({ ...exp, duration: e.target.value }))}
                          placeholder="Duration"
                        />
                        <textarea
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newExperience.description}
                          onChange={e => setNewExperience(exp => ({ ...exp, description: e.target.value }))}
                          placeholder="Description"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-[#D96E36] text-white" onClick={handleAddExperience}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => { setAddingExperience(false); setNewExperience({ position: '', company: '', duration: '', description: '' }); }}>Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  {experiences.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No experiences found.</Card>
                  ) : (
                    experiences.map(exp => {
                      const expanded = expandedExperience === exp.id;
                      const editing = editingExperience === exp.id;
                      return (
                        <Card key={exp.id} className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedExperience(expanded ? null : exp.id)}>
                            <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center">
                              {expanded ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
                              {exp.position} {exp.company && <span className="text-base text-gray-600">- {exp.company}</span>}
                            </div>
                            {!editing && <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); startExperienceEdit(exp); }}>Edit</Button>}
                          </div>
                          {expanded && (
                            <div className="mt-2">
                              {editing ? (
                                <div className="flex flex-col gap-2">
                                  <input
                                    className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={experienceEdits.position || ""}
                                    onChange={e => handleExperienceEdit(exp.id, "position", e.target.value)}
                                    placeholder="Position"
                                  />
                                  <input
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={experienceEdits.company || ""}
                                    onChange={e => handleExperienceEdit(exp.id, "company", e.target.value)}
                                    placeholder="Company"
                                  />
                                  <input
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={experienceEdits.duration || ""}
                                    onChange={e => handleExperienceEdit(exp.id, "duration", e.target.value)}
                                    placeholder="Duration"
                                  />
                                  <textarea
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={experienceEdits.description || ""}
                                    onChange={e => handleExperienceEdit(exp.id, "description", e.target.value)}
                                    placeholder="Description"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => saveExperienceEdit(exp.id)}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={cancelExperienceEdit}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-base mb-1 bg-[#FCF9F4] rounded p-2">{exp.position}</div>
                                  {exp.company && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{exp.company}</div>}
                                  {exp.duration && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{exp.duration}</div>}
                                  <div className="bg-[#FCF9F4] rounded p-2 mb-1 whitespace-pre-line">{exp.description}</div>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => startExperienceEdit(exp)}>Edit</Button>
                                    <Button size="sm" className="bg-[#6B3F1D] text-white" onClick={() => setDeleteModal({ type: 'experience', id: exp.id })}>Delete</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              ) : activeSection === "Education" ? (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold mr-4">Education</h2>
                    <Button size="sm" className="bg-[#D96E36] text-white ml-auto" onClick={() => setAddingEducation(true)}>+ Add Education</Button>
                  </div>
                  {addingEducation && (
                    <Card className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                      <div className="flex flex-col gap-2">
                        <input
                          className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newEducation.degree}
                          onChange={e => setNewEducation(ed => ({ ...ed, degree: e.target.value }))}
                          placeholder="Degree"
                        />
                        <input
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newEducation.institution}
                          onChange={e => setNewEducation(ed => ({ ...ed, institution: e.target.value }))}
                          placeholder="Institution"
                        />
                        <input
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newEducation.year}
                          onChange={e => setNewEducation(ed => ({ ...ed, year: e.target.value }))}
                          placeholder="Year"
                        />
                        <textarea
                          className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                          value={newEducation.description}
                          onChange={e => setNewEducation(ed => ({ ...ed, description: e.target.value }))}
                          placeholder="Description"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-[#D96E36] text-white" onClick={handleAddEducation}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => { setAddingEducation(false); setNewEducation({ degree: '', institution: '', year: '', description: '' }); }}>Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  {education.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No education found.</Card>
                  ) : (
                    education.map(edu => {
                      const expanded = expandedEducation === edu.id;
                      const editing = editingEducation === edu.id;
                      return (
                        <Card key={edu.id} className="flex flex-col border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition mb-3">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedEducation(expanded ? null : edu.id)}>
                            <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center">
                              {expanded ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
                              {edu.degree} {edu.institution && <span className="text-base text-gray-600 ml-2">- {edu.institution}</span>}
                            </div>
                          </div>
                          {expanded && (
                            <div className="mt-2">
                              {editing ? (
                                <div className="flex flex-col gap-2">
                                  <input
                                    className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={educationEdits.degree || ''}
                                    onChange={e => handleEducationEdit(edu.id, 'degree', e.target.value)}
                                    placeholder="Degree"
                                  />
                                  <input
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={educationEdits.institution || ''}
                                    onChange={e => handleEducationEdit(edu.id, 'institution', e.target.value)}
                                    placeholder="Institution"
                                  />
                                  <input
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={educationEdits.year || ''}
                                    onChange={e => handleEducationEdit(edu.id, 'year', e.target.value)}
                                    placeholder="Year"
                                  />
                                  <textarea
                                    className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                                    value={educationEdits.description || ''}
                                    onChange={e => handleEducationEdit(edu.id, 'description', e.target.value)}
                                    placeholder="Description"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => saveEducationEdit(edu.id)}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={cancelEducationEdit}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-base mb-1 bg-[#FCF9F4] rounded p-2">{edu.degree}</div>
                                  {edu.institution && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{edu.institution}</div>}
                                  {edu.year && <div className="bg-[#FCF9F4] rounded p-2 mb-1">{edu.year}</div>}
                                  <div className="bg-[#FCF9F4] rounded p-2 mb-1 whitespace-pre-line">{edu.description}</div>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-[#D96E36] text-white" onClick={() => startEducationEdit(edu)}>Edit</Button>
                                    <Button size="sm" className="bg-[#6B3F1D] text-white" onClick={() => setDeleteModal({ type: 'education', id: edu.id })}>Delete</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              ) : activeSection === "Skills" ? (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold mr-4">Skills</h2>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input
                      className="border border-[#ece7df] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
                    />
                    <Button
                      className="bg-[#D96E36] text-white px-4 py-2 rounded font-semibold"
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {skills.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No skills found.</Card>
                  ) : (
                    <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-6 border border-[#ece7df] bg-white">
                      {skills.map(skill => (
                        <span
                          key={skill.id}
                          className="relative bg-[#FCF9F4] border border-[#ece7df] rounded px-3 py-2 text-sm font-medium text-[#222] flex items-center group transition-shadow hover:shadow-sm"
                        >
                          {skill.name}
                          <button
                            className="ml-2 text-[#D96E36] hover:text-red-600 text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity absolute top-1 right-1"
                            title="Remove skill"
                            onClick={() => handleRemoveSkill(skill.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </Card>
                  )}
                </div>
              ) : null}
            </div>
            {/* Confirmation Modal */}
            <Dialog open={!!deleteModal.type} onOpenChange={open => { if (!open) setDeleteModal({ type: '', id: null }); }}>
              <DialogContent>
                <DialogTitle>Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}</DialogTitle>
                <DialogDescription>Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.</DialogDescription>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteModal({ type: '', id: null })}>Cancel</Button>
                  <Button
                    className="bg-[#D96E36] text-white"
                    onClick={() => {
                      if (deleteModal.id !== null) handleDelete(deleteModal.type, deleteModal.id);
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
} 