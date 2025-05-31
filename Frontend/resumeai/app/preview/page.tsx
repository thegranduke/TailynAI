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
} from "@/components/ui/sidebar";
import { ResumeSectionEditor } from "@/components/resume-section-editor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Save, 
  Download,
  User2,
  Briefcase,
  GraduationCap,
  Zap,
  Rocket,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ResumePDF from "@/components/ResumePDF";
import { pdf } from "@react-pdf/renderer";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";

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

interface Project {
  id: number;
  name: string;
  description: string;
  link?: string;
}

interface DatabaseItems {
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}

const sections = [
  { id: 'basics', label: 'Basic Info', icon: User2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'projects', label: 'Projects', icon: Rocket },
];

export default function PreviewPage() {
  const personal = useResumeStore(s => s.personal);
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);
  const education = useResumeStore(s => s.education);
  const setPersonal = useResumeStore(s => s.setPersonal);
  const setSkills = useResumeStore(s => s.setSkills);
  const setExperiences = useResumeStore(s => s.setExperiences);
  const setProjects = useResumeStore(s => s.setProjects);
  const setEducation = useResumeStore(s => s.setEducation);
  const [activeSection, setActiveSection] = useState('basics');
  
  // State for database items
  const [databaseItems, setDatabaseItems] = useState<DatabaseItems>({
    experiences: [],
    education: [],
    projects: [],
  });

  const { user } = useUser();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch database items
  useEffect(() => {
    if (!user?.id) return;
    const fetchDatabaseItems = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const [experiencesRes, educationRes, projectsRes] = await Promise.all([
          supabase.from('work_experiences').select('*').eq('profile_id', user.id),
          supabase.from('education').select('*').eq('profile_id', user.id),
          supabase.from('projects').select('*').eq('profile_id', user.id),
        ]);

        setDatabaseItems({
          experiences: experiencesRes.data as Experience[] || [],
          education: educationRes.data as Education[] || [],
          projects: projectsRes.data as Project[] || [],
        });
      } catch (err) {
        console.error('Failed to fetch database items:', err);
      }
    };

    fetchDatabaseItems();
  }, [user?.id]);

  useEffect(() => {
    const job_id = searchParams.get("job_id");
    if (!user?.id || !job_id) return;
    setLoading(true);
    setError(null);
    fetchResumeData(user.id, job_id)
      .then(data => {
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

  // Function to add items from database
  const handleAddFromDatabase = (type: 'experiences' | 'education' | 'projects', itemId: string) => {
    const item = databaseItems[type].find(i => i.id.toString() === itemId);
    if (!item) return;

    switch (type) {
      case 'experiences': {
        const exp = item as Experience;
        const isExisting = experiences.some(e => e.id === exp.id);
        if (!isExisting) {
          const newExperiences = [...experiences, exp];
          setExperiences(newExperiences);
        }
        break;
      }
      case 'education': {
        const edu = item as Education;
        const isExisting = education.some(e => e.id === edu.id);
        if (!isExisting) {
          const newEducation = [...education, edu];
          setEducation(newEducation);
        }
        break;
      }
      case 'projects': {
        const proj = item as Project;
        const isExisting = projects.some(p => p.id === proj.id);
        if (!isExisting) {
          const newProjects = [...projects, proj];
          setProjects(newProjects);
        }
        break;
      }
    }
  };

  // Helper function to render item label
  const getItemLabel = (item: Experience | Education | Project, type: 'experiences' | 'education' | 'projects'): string => {
    if (type === 'experiences') {
      const exp = item as Experience;
      return `${exp.position} at ${exp.company}`;
    } else if (type === 'education') {
      const edu = item as Education;
      return `${edu.degree} at ${edu.institution}`;
    } else {
      const proj = item as Project;
      return proj.name;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(
        <ResumePDF
          personal={personal}
          skills={skills}
          experiences={experiences}
          projects={projects}
          education={education}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${personal.name ? personal.name.replace(/\s+/g, '_') : 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCF9F4]">
      <SidebarProvider style={{ "--sidebar-width": "450px" } as React.CSSProperties}>
        <Sidebar className="border-r border-[#ece7df] bg-[#FFFEFB]">
          <SidebarContent className="flex flex-col h-full gap-0">
            {/* Header */}
            <div className="shrink-0 border-b border-[#ece7df]">
              <div className="px-4 h-14 flex items-center justify-between">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center text-[#666] hover:text-[#222] transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  Back to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-[#666] hover:text-[#222]"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-[#D96E36] hover:bg-[#D96E36]/90 text-white"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="p-4 pb-0">
                <nav className="bg-white rounded-lg p-1.5 flex items-center gap-1 border border-[#ece7df]">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-1 p-2 rounded-md transition-all ${
                          activeSection === section.id
                            ? 'bg-[#D96E36]/5 text-[#D96E36]'
                            : 'text-[#666] hover:text-[#222] hover:bg-[#FCF9F4]'
                        }`}
                        title={section.label}
                      >
                        <Icon className="w-4 h-4 mx-auto" />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Section Title */}
              <div className="py-3 text-center">
                <h2 className="text-lg font-medium tracking-wide text-[#222]">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
              </div>
            </div>

            {/* Add from Database Section */}
            {activeSection !== 'basics' && activeSection !== 'skills' && (
              <div className="px-6 py-4 border-b border-[#ece7df] bg-[#FFFEFB]">
                <Select 
                  onValueChange={(value) => handleAddFromDatabase(
                    activeSection === 'experience' ? 'experiences' : 
                    activeSection === 'education' ? 'education' : 'projects', 
                    value
                  )}
                >
                  <SelectTrigger className="w-full bg-white border-[#ece7df] text-[#666] hover:text-[#222]">
                    <SelectValue placeholder={`Add existing ${activeSection}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-[#666]">Select from your database</SelectLabel>
                      {databaseItems[
                        activeSection === 'experience' ? 'experiences' : 
                        activeSection === 'education' ? 'education' : 'projects'
                      ].map((item) => {
                        const type = activeSection === 'experience' ? 'experiences' : 
                                   activeSection === 'education' ? 'education' : 'projects';
                        return (
                          <SelectItem 
                            key={item.id} 
                            value={item.id.toString()}
                            className="text-[#222] hover:text-[#D96E36] cursor-pointer"
                          >
                            {getItemLabel(item, type)}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="">
                <ResumeSectionEditor section={activeSection} />
              </div>
            </ScrollArea>
            </SidebarContent>
          </Sidebar>

        {/* Main Preview Area */}
        <main className="flex-1 min-h-screen flex flex-col">
          <div className="flex-1 p-6">
            <div className="h-full flex items-center">
              {error ? (
                <div className="text-red-500 p-8">{error}</div>
              ) : (
                <ResumePreview />
              )}
            </div>
            </div>
          </main>
      </SidebarProvider>
    </div>
  );
} 