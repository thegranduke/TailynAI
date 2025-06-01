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
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "sonner";
import { CreateResumeDialog, ImportResumeDialog } from "@/components/resume-dialogs";
import { EditDialog } from "@/components/edit-dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
    <Sidebar 
      className="border-r border-[#ece7df] bg-[#FFFEFB] w-64 h-full" 
      collapsible="offcanvas"
    >
      <SidebarContent className="flex flex-col h-full gap-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <span className="text-2xl font-bold text-[#D96E36]">Taylin</span>
          </Link>
          <nav>
              {sidebarLinks.map(link => (
                    <button
                key={link.label}
                      onClick={() => setActiveSection(link.section)}
                className={`w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeSection === link.section 
                  ? 'text-[#D96E36] bg-[#D96E36]/5 font-medium' 
                  : 'text-[#666] hover:text-[#222] hover:bg-[#FFFEFB]'
                }`}
                    >
                      {link.label}
                    </button>
              ))}
          </nav>
        </div>
      <SidebarAccountFooter />
      </SidebarContent>
    </Sidebar>
  );
}

interface Project {
  id: number;
  name: string;
  description: string;
  link?: string;
}

interface Experience {
  id: number;
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
}

interface Skill {
  id: number;
  name: string;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: number } | null>(null);
  const router = useRouter();

  // Refresh data when returning to dashboard
  useEffect(() => {
    const refreshData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
      try {
        const [jobsData, projectsData, experiencesData, educationData, skillsData] = await Promise.all([
      fetchDashboardJobs(user.id),
      fetchProjects(user.id),
      fetchExperiences(user.id),
      fetchEducation(user.id),
      fetchSkills(user.id)
        ]);
        setJobs(jobsData);
        setProjects(projectsData);
        setExperiences(experiencesData);
        setEducation(educationData);
        setSkills(skillsData);
      } catch (e) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    refreshData();

    // Add event listener for focus
    window.addEventListener('focus', refreshData);
    return () => window.removeEventListener('focus', refreshData);
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
    setProjectEdits({
      name: project.name,
      description: project.description,
      link: project.link || ''
    });
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
    setExperienceEdits({
      position: exp.position,
      company: exp.company,
      duration: exp.duration,
      description: exp.description
    });
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
    setEducationEdits({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year
    });
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

  const handleDeleteClick = (type: string, id: number) => {
    setDeleteItem({ type, id });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem || !user?.id) return;
    
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    switch (deleteItem.type) {
      case 'project':
        await supabase.from('projects').delete().eq('id', deleteItem.id);
        setProjects(projects => projects.filter(p => p.id !== deleteItem.id));
        break;
      case 'experience':
        await supabase.from('work_experiences').delete().eq('id', deleteItem.id);
        setExperiences(experiences => experiences.filter(e => e.id !== deleteItem.id));
        break;
      case 'education':
        await supabase.from('education').delete().eq('id', deleteItem.id);
        setEducation(education => education.filter(e => e.id !== deleteItem.id));
        break;
    }

    setDeleteConfirmOpen(false);
    setDeleteItem(null);
  };

  return (
    <div className="flex min-h-screen bg-[#FCF9F4]">
      <SidebarProvider>
          <DashboardSidebar setActiveSection={setActiveSection} activeSection={activeSection} />
        <main className="flex-1 min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-[2rem] font-medium text-[#222]">{activeSection}</h1>
            </div>
                
                {activeSection === "Resumes" && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center rounded-md overflow-hidden border border-[#ece7df] bg-white">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-[#666] hover:text-[#222]'}`}
                        title="Grid view"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-[#666] hover:text-[#222]'}`}
                        title="List view"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      </button>
                    </div>
                </div>
                )}
            </div>

              {/* Content */}
              {activeSection === "Resumes" && (
                <div className={`transition-all duration-300 ease-in-out ${
                  viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-100' 
                  : 'flex-1 flex justify-center opacity-100'
                }`}>
                  {viewMode === 'grid' ? (
                    <>
                      <button 
                        onClick={() => setCreateDialogOpen(true)}
                        className="block group [perspective:1000px] animate-in fade-in duration-300"
                      >
                        <div className="relative aspect-[3/4] bg-[#222] text-white rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateX(4deg)] will-change-transform [transform-style:preserve-3d] [transform-origin:50%_100%]">
                          <div className="mb-6">
                            <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:border-white transition-colors">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-colors">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                </div>
                      </div>
                          <span className="text-lg font-medium">Create a new resume</span>
                          <span className="text-sm text-white/70 mt-2">Start building from scratch</span>
                      </div>
                      </button>
                      <button
                        onClick={() => setImportDialogOpen(true)}
                        className="block group [perspective:1000px] animate-in fade-in duration-300"
                      >
                        <div className="relative aspect-[3/4] bg-[#C4532D] text-white rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateX(4deg)] will-change-transform [transform-style:preserve-3d] [transform-origin:50%_100%]">
                          <div className="mb-6">
                            <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:border-white transition-colors">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-colors">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                    </div>
                          </div>
                          <span className="text-lg font-medium">Import an existing...</span>
                          <span className="text-sm text-white/70 mt-2">LinkedIn, JSON Resume, etc.</span>
                        </div>
                      </button>
                      {jobs?.map(job => (
                        <Link key={job.id} href={`/preview?job_id=${job.id}`} className="block group [perspective:1000px] animate-in fade-in duration-300">
                          <div className="relative aspect-[3/4] bg-white rounded-sm p-6 flex flex-col border border-[#ece7df] cursor-pointer transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateX(4deg)] will-change-transform [transform-style:preserve-3d] [transform-origin:50%_100%]">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-[#222] line-clamp-2">{job.title}</h3>
                              <p className="text-sm text-[#666] mt-1">{job.company}</p>
                              <div className="mt-4 text-xs text-[#666]">
                                Created {formatDate(job.created_at)}
                                  </div>
                                </div>
                            <div className="mt-6 pt-6 border-t border-[#ece7df]">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-[#666]">View Resume</div>
                                <ChevronRight className="w-4 h-4 text-[#666] group-hover:text-[#D96E36] transition-colors" />
                                </div>
                            </div>
                          </div>
                      </Link>
                      ))}
                    </>
                  ) : (
                    <div className="w-full bg-white/40 backdrop-blur-sm rounded-sm border border-[#ece7df] shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-300">
                      <button
                        onClick={() => setCreateDialogOpen(true)}
                        className="flex items-center gap-3 p-4 hover:bg-white/60 transition-colors duration-200 border-b border-[#ece7df] w-full text-left"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#222] text-white shadow-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                    </div>
                <div>
                          <h3 className="font-medium text-[#222]">Create a new resume</h3>
                          <p className="text-sm text-[#666]">Start building from scratch</p>
                  </div>
                      </button>
                      <button
                        onClick={() => setImportDialogOpen(true)}
                        className="flex items-center gap-3 p-4 hover:bg-white/60 transition-colors duration-200 border-b border-[#ece7df] w-full text-left"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D96E36] text-white shadow-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-[#222]">Import an existing resume</h3>
                          <p className="text-sm text-[#666]">LinkedIn, JSON Resume, etc.</p>
                      </div>
                      </button>
                      {jobs?.length > 0 ? jobs.map((job, index) => (
                        <Link 
                          key={job.id} 
                          href={`/preview?job_id=${job.id}`}
                          className="flex items-center gap-3 p-4 hover:bg-white/80 group transition-colors duration-200 border-b border-[#ece7df] last:border-b-0"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FCF9F4] text-[#D96E36] border border-[#ece7df] group-hover:bg-[#D96E36] group-hover:text-white group-hover:border-[#D96E36] transition-colors">
                            {job.title[0].toUpperCase()}
                            </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#222] truncate group-hover:text-[#D96E36] transition-colors">{job.title}</h3>
                            <p className="text-sm text-[#666] mt-0.5">{job.company}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-[#666]">
                              {formatDate(job.created_at)}
                                  </div>
                            <div className="flex items-center text-sm text-[#666] group-hover:text-[#D96E36] transition-colors">
                              <span className="mr-2">Preview</span>
                              <ChevronRight className="w-4 h-4" />
                                </div>
                                  </div>
                        </Link>
                      )) : (
                        <div className="p-6 text-center text-[#666]">
                          No resumes yet. Create your first resume to get started.
                                </div>
                              )}
                            </div>
                          )}
                </div>
              )}

              {activeSection === "Projects" && (
                <div className="w-full bg-white/40 backdrop-blur-sm rounded-sm border border-[#ece7df] shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-4 border-b border-[#ece7df] flex justify-between items-center">
                    <h2 className="text-lg font-medium text-[#222]">Projects</h2>
                    <Button 
                      onClick={() => {
                        setProjectEdits({});
                        setEditingProject(-1);
                      }} 
                      className="bg-[#D96E36] text-white hover:bg-[#b85a28]"
                    >
                      Add Project
                    </Button>
                </div>
                  <div className="divide-y divide-[#ece7df]">
                    {projects.map((project) => (
                      <div key={project.id} className="p-6 hover:bg-white/60 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-[#222] hover:text-[#D96E36] transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-[#666] leading-relaxed">{project.description}</p>
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-[#D96E36] hover:text-[#b85a28] transition-colors"
                              >
                                View Project
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </a>
                            )}
                  </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startProjectEdit(project)} 
                              className="text-[#666] hover:text-[#D96E36]">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('project', project.id)} 
                              className="text-red-600 hover:text-red-700">
                              Delete
                            </Button>
                        </div>
                      </div>
                            </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="p-6 text-center text-[#666]">
                        No projects yet. Add your first project to get started.
                          </div>
                    )}
                                  </div>
                                </div>
              )}

              {activeSection === "Experiences" && (
                <div className="w-full bg-white/40 backdrop-blur-sm rounded-sm border border-[#ece7df] shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-4 border-b border-[#ece7df] flex justify-between items-center">
                    <h2 className="text-lg font-medium text-[#222]">Work Experience</h2>
                    <Button 
                      onClick={() => {
                        setExperienceEdits({});
                        setEditingExperience(-1);
                      }}
                      className="bg-[#D96E36] text-white hover:bg-[#b85a28]"
                    >
                      Add Experience
                    </Button>
                                  </div>
                  <div className="divide-y divide-[#ece7df]">
                    {experiences.map((experience) => (
                      <div key={experience.id} className="p-6 hover:bg-white/60 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-[#222] hover:text-[#D96E36] transition-colors">
                              {experience.position}
                            </h3>
                            <p className="text-[#666]">{experience.company}</p>
                            <p className="text-sm text-[#666]">{experience.duration}</p>
                            <p className="text-[#666] leading-relaxed">{experience.description}</p>
                                </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startExperienceEdit(experience)}
                              className="text-[#666] hover:text-[#D96E36]">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('experience', experience.id)}
                              className="text-red-600 hover:text-red-700">
                              Delete
                            </Button>
                            </div>
                </div>
                  </div>
                    ))}
                    {experiences.length === 0 && (
                      <div className="p-6 text-center text-[#666]">
                        No work experience yet. Add your first position to get started.
                        </div>
                              )}
                      </div>
                </div>
              )}

              {activeSection === "Education" && (
                <div className="w-full bg-white/40 backdrop-blur-sm rounded-sm border border-[#ece7df] shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-4 border-b border-[#ece7df] flex justify-between items-center">
                    <h2 className="text-lg font-medium text-[#222]">Education</h2>
                    <Button 
                      onClick={() => {
                        setEducationEdits({});
                        setEditingEducation(-1);
                      }}
                      className="bg-[#D96E36] text-white hover:bg-[#b85a28]"
                    >
                      Add Education
                    </Button>
                            </div>
                  <div className="divide-y divide-[#ece7df]">
                    {education.map((edu) => (
                      <div key={edu.id} className="p-6 hover:bg-white/60 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-[#222] hover:text-[#D96E36] transition-colors">
                              {edu.degree}
                            </h3>
                            <p className="text-[#666]">{edu.institution}</p>
                            <p className="text-sm text-[#666]">{edu.year}</p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startEducationEdit(edu)}
                              className="text-[#666] hover:text-[#D96E36]">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('education', edu.id)}
                              className="text-red-600 hover:text-red-700">
                              Delete
                            </Button>
                                  </div>
                                </div>
                                  </div>
                    ))}
                    {education.length === 0 && (
                      <div className="p-6 text-center text-[#666]">
                        No education history yet. Add your first degree to get started.
                                </div>
                              )}
                            </div>
                </div>
              )}

              {activeSection === "Skills" && (
                <div className="w-full bg-white/40 backdrop-blur-sm rounded-sm border border-[#ece7df] shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-4 border-b border-[#ece7df] flex justify-between items-center">
                    <h2 className="text-lg font-medium text-[#222]">Skills</h2>
                    <div className="flex gap-2">
                      <Input
                      value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill..."
                        className="w-64 border-[#ece7df] focus:ring-[#D96E36]"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button
                      onClick={handleAddSkill}
                        className="bg-[#D96E36] text-white hover:bg-[#b85a28]"
                    >
                      Add
                    </Button>
                  </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="px-3 py-1.5 rounded-full bg-white border border-[#ece7df] text-sm text-[#666] flex items-center gap-2 group hover:border-[#D96E36] hover:text-[#D96E36] transition-colors"
                        >
                          {skill.name}
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D96E36] hover:text-[#b85a28]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {skills.length === 0 && (
                      <div className="text-center text-[#666]">
                        No skills added yet. Add your first skill to get started.
                      </div>
                  )}
                </div>
            </div>
              )}
            </div>
          </div>
        </main>
      </SidebarProvider>

      {/* Dialogs */}
      <CreateResumeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        projects={projects}
        experiences={experiences}
      />
      <ImportResumeDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />

      {/* Edit Dialogs */}
      <EditDialog<Project>
        open={!!editingProject}
        onOpenChange={(open: boolean) => !open && setEditingProject(null)}
        title={editingProject ? "Edit Project" : "Add Project"}
        fields={[
          { name: "name", label: "Project Name", type: "text", placeholder: "e.g. Personal Portfolio" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe your project..." },
          { name: "link", label: "Project Link", type: "text", placeholder: "e.g. https://github.com/username/project" }
        ]}
        initialData={projectEdits}
        onSave={async (data: Project) => {
          if (editingProject) {
            await saveProjectEdit(editingProject);
          } else {
            setNewProject({ name: data.name, description: data.description });
            await handleAddProject();
          }
        }}
      />

      <EditDialog<Experience>
        open={!!editingExperience}
        onOpenChange={(open: boolean) => !open && setEditingExperience(null)}
        title={editingExperience ? "Edit Experience" : "Add Experience"}
        fields={[
          { name: "position", label: "Position", type: "text", placeholder: "e.g. Software Engineer" },
          { name: "company", label: "Company", type: "text", placeholder: "e.g. Google" },
          { name: "duration", label: "Duration", type: "text", placeholder: "e.g. Jan 2020 - Present" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe your role and achievements..." }
        ]}
        initialData={experienceEdits}
        onSave={async (data: Experience) => {
          if (editingExperience) {
            await saveExperienceEdit(editingExperience);
          } else {
            setNewExperience({ 
              position: data.position, 
              company: data.company, 
              duration: data.duration, 
              description: data.description 
            });
            await handleAddExperience();
          }
        }}
      />

      <EditDialog<Education>
        open={!!editingEducation}
        onOpenChange={(open: boolean) => !open && setEditingEducation(null)}
        title={editingEducation ? "Edit Education" : "Add Education"}
        fields={[
          { name: "degree", label: "Degree", type: "text", placeholder: "e.g. Bachelor of Science in Computer Science" },
          { name: "institution", label: "Institution", type: "text", placeholder: "e.g. Stanford University" },
          { name: "year", label: "Year", type: "text", placeholder: "e.g. 2020" }
        ]}
        initialData={educationEdits}
        onSave={async (data: Education) => {
          if (editingEducation) {
            await saveEducationEdit(editingEducation);
          } else {
            setNewEducation({ 
              degree: data.degree, 
              institution: data.institution, 
              year: data.year,
              description: '' 
            });
            await handleAddEducation();
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            This will permanently delete this {deleteItem?.type}. This action cannot be undone.
          </p>
                <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

      {/* Toast Container */}
      <Toaster />
    </div>
  );
} 