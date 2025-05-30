import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ResumeSectionEditorProps {
  section: string;
}

const inputStyles = {
  base: "w-full focus-visible:ring-1 focus-visible:ring-[#D96E36] focus-visible:ring-offset-0 placeholder:text-[#666]/50 border-[#ece7df]",
  title: "text-lg font-medium bg-transparent border-0 border-[#ece7df]",
  subtitle: "text-base bg-transparent border-0 border-[#ece7df]",
  content: "min-h-[100px] text-sm resize-vertical bg-[#FFFEFB] border-[#ece7df]",
};

export function ResumeSectionEditor({ section }: ResumeSectionEditorProps) {
  const personal = useResumeStore(s => s.personal);
  const experiences = useResumeStore(s => s.experiences);
  const education = useResumeStore(s => s.education);
  const skills = useResumeStore(s => s.skills);
  const projects = useResumeStore(s => s.projects);
  
  const setPersonal = useResumeStore(s => s.setPersonal);
  const setExperiences = useResumeStore(s => s.setExperiences);
  const setEducation = useResumeStore(s => s.setEducation);
  const setSkills = useResumeStore(s => s.setSkills);
  const setProjects = useResumeStore(s => s.setProjects);

  const renderBasicsSection = () => (
    <div className="space-y-6 bg-white border border-[#ece7df] rounded-lg p-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#666]">Full Name</Label>
        <Input
          id="name"
          value={personal?.name || ''}
          onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
          className={cn(inputStyles.base, inputStyles.title)}
          placeholder="Enter your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline" className="text-sm font-medium text-[#666]">Professional Headline</Label>
        <Input
          id="headline"
          value={personal?.headline || ''}
          onChange={(e) => setPersonal({ ...personal, headline: e.target.value })}
          className={cn(inputStyles.base, inputStyles.subtitle)}
          placeholder="e.g. Senior Software Engineer | AI Specialist"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#666]">Email</Label>
          <Input
            id="email"
            value={personal?.email || ''}
            onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
            className={cn(inputStyles.base)}
            placeholder="your@email.com"
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-[#666]">Location</Label>
          <Input
            id="location"
            value={personal?.location || ''}
            onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
            className={cn(inputStyles.base)}
            placeholder="City, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-4">
      {experiences?.map((exp, index) => (
        <Collapsible key={index} defaultOpen={true} className="group border border-[#ece7df] rounded-lg overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-6 py-4">
            <GripVertical className="w-4 h-4 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center w-full group/title">
                <Input
                  value={exp.company}
                  onChange={(e) => {
                    const newExperiences = [...experiences];
                    newExperiences[index] = { ...exp, company: e.target.value };
                    setExperiences(newExperiences);
                  }}
                  className={cn(inputStyles.base, inputStyles.title)}
                  placeholder="Company Name"
                />
                <ChevronDown className="w-4 h-4 text-[#666] transition-transform duration-200 ease-in-out group-data-[state=open]/title:rotate-180" />
              </CollapsibleTrigger>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-red-500 hover:bg-transparent"
              onClick={() => {
                const newExperiences = experiences.filter((_, i) => i !== index);
                setExperiences(newExperiences);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-4 bg-[#FFFEFB] border-t border-[#ece7df]">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666]">Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => {
                    const newExperiences = [...experiences];
                    newExperiences[index] = { ...exp, position: e.target.value };
                    setExperiences(newExperiences);
                  }}
                  className={cn(inputStyles.base, inputStyles.subtitle)}
                  placeholder="Your role at the company"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666]">Duration</Label>
                <Input
                  value={exp.duration}
                  onChange={(e) => {
                    const newExperiences = [...experiences];
                    newExperiences[index] = { ...exp, duration: e.target.value };
                    setExperiences(newExperiences);
                  }}
                  className={cn(inputStyles.base)}
                  placeholder="e.g. Jan 2020 - Present"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666]">Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => {
                    const newExperiences = [...experiences];
                    newExperiences[index] = { ...exp, description: e.target.value };
                    setExperiences(newExperiences);
                  }}
                  className={cn(inputStyles.base, inputStyles.content)}
                  placeholder="• Describe your key responsibilities and achievements&#13;• Use bullet points for better readability&#13;• Focus on quantifiable results"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed border-[#ece7df] hover:border-[#D96E36] hover:bg-[#FCF9F4] h-auto py-3"
        onClick={() => {
          setExperiences([
            ...experiences,
            { id: Date.now(), company: '', position: '', duration: '', description: '' }
          ]);
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-4">
      {education?.map((edu, index) => (
        <Collapsible key={index} defaultOpen={true} className="group border border-[#ece7df] rounded-lg overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-6 py-4">
            <GripVertical className="w-4 h-4 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center w-full group/title">
                <Input
                  value={edu.institution}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = { ...edu, institution: e.target.value };
                    setEducation(newEducation);
                  }}
                  className={cn(inputStyles.base, inputStyles.title)}
                  placeholder="Institution Name"
                />
                <ChevronDown className="w-4 h-4 text-[#666] transition-transform duration-200 ease-in-out group-data-[state=open]/title:rotate-180" />
              </CollapsibleTrigger>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-red-500 hover:bg-transparent"
              onClick={() => {
                const newEducation = education.filter((_, i) => i !== index);
                setEducation(newEducation);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-4 bg-[#FFFEFB] border-t border-[#ece7df]">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666]">Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = { ...edu, degree: e.target.value };
                    setEducation(newEducation);
                  }}
                  className={cn(inputStyles.base, inputStyles.subtitle)}
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666]">Year</Label>
                <Input
                  value={edu.year}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = { ...edu, year: e.target.value };
                    setEducation(newEducation);
                  }}
                  className={cn(inputStyles.base)}
                  placeholder="e.g. 2018 - 2022"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed border-[#ece7df] hover:border-[#D96E36] hover:bg-[#FCF9F4] h-auto py-3"
        onClick={() => {
          setEducation([
            ...education,
            { id: Date.now(), institution: '', degree: '', year: '' }
          ]);
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="bg-white border border-[#ece7df] rounded-lg p-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-[#666]">Skills</Label>
          <div className="flex flex-wrap gap-2">
            {skills?.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-[#FFFEFB] hover:bg-[#FFFEFB] text-[#666] border border-[#ece7df] group px-3 py-1.5 text-sm transition-colors hover:border-[#D96E36]/30"
              >
                {skill.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent hover:text-red-500"
                  onClick={() => {
                    const newSkills = skills.filter((_, i) => i !== index);
                    setSkills(newSkills);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g. React, Project Management, Data Analysis)"
              className={cn(inputStyles.base, "flex-1")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setSkills([...skills, { id: Date.now(), name: e.currentTarget.value }]);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              className="border-[#ece7df] hover:border-[#D96E36]/30 hover:bg-[#FCF9F4]"
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                if (input?.value) {
                  setSkills([...skills, { id: Date.now(), name: input.value }]);
                  input.value = '';
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-4">
      {projects?.map((project, index) => (
        <Collapsible key={index} defaultOpen={true} className="group border border-[#ece7df] rounded-lg overflow-hidden bg-white hover:border-[#D96E36]/30 transition-colors">
          <div className="flex items-center gap-2 px-4 py-3">
            <GripVertical className="w-4 h-4 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center w-full group/title">
                <Input
                  value={project.name}
                  onChange={(e) => {
                    const newProjects = [...projects];
                    newProjects[index] = { ...project, name: e.target.value };
                    setProjects(newProjects);
                  }}
                  className={cn(inputStyles.base, inputStyles.title)}
                  placeholder="Project Name"
                />
                <ChevronDown className="w-4 h-4 text-[#666] transition-transform duration-200 ease-in-out group-data-[state=open]/title:rotate-180" />
              </CollapsibleTrigger>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666] hover:text-red-500 hover:bg-transparent -my-2"
              onClick={() => {
                const newProjects = projects.filter((_, i) => i !== index);
                setProjects(newProjects);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 bg-[#FFFEFB] border-t border-[#ece7df]">
              <Textarea
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = { ...project, description: e.target.value };
                  setProjects(newProjects);
                }}
                className={cn(inputStyles.base, inputStyles.content, "resize-none min-h-[80px]")}
                placeholder="Description"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed border-[#ece7df] hover:border-[#D96E36] hover:bg-[#FCF9F4] h-auto py-3"
        onClick={() => {
          setProjects([
            ...projects,
            { id: Date.now(), name: '', description: '' }
          ]);
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </Button>
    </div>
  );

  const sectionContent = {
    basics: renderBasicsSection,
    experience: renderExperienceSection,
    education: renderEducationSection,
    skills: renderSkillsSection,
    projects: renderProjectsSection,
  };

  return (
    <div className="p-4">
      {sectionContent[section as keyof typeof sectionContent]?.()}
    </div>
  );
} 