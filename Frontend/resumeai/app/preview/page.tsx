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
  Rocket
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sections = [
  { id: 'basics', label: 'Basic Info', icon: User2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'projects', label: 'Projects', icon: Rocket },
];

export default function PreviewPage() {
  const setPersonal = useResumeStore(s => s.setPersonal);
  const setSkills = useResumeStore(s => s.setSkills);
  const setExperiences = useResumeStore(s => s.setExperiences);
  const setProjects = useResumeStore(s => s.setProjects);
  const setEducation = useResumeStore(s => s.setEducation);
  const [activeSection, setActiveSection] = useState('basics');

  const { user } = useUser();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen bg-[#FCF9F4]">
      <SidebarProvider style={{ "--sidebar-width": "450px" } as React.CSSProperties}>
        <Sidebar className="border-r border-[#ece7df] bg-[#FFFEFB]">
          <SidebarContent className="flex flex-col h-full">
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
                <nav className="bg-[#FCF9F4]/50 rounded-lg p-1.5 flex items-center gap-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-1 p-2 rounded-md transition-all ${
                          activeSection === section.id
                            ? 'text-[#D96E36]'
                            : 'text-[#666] hover:text-[#222] hover:bg-white/50'
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
              <div className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#222]">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <span className="text-xs text-[#666]">
                  {activeSection === 'basics' ? 'Personal Information' : 
                   activeSection === 'experience' ? 'Work History' :
                   activeSection === 'education' ? 'Academic Background' :
                   activeSection === 'skills' ? 'Technical Skills' : 'Portfolio'}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-6 pr-4">
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