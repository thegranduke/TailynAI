import React, { useRef, useEffect, useState } from "react";
import { useResumeStore } from "../store/useResumeStore";
import ResumePDF from "./ResumePDF";
import { AspectRatio } from "./ui/aspect-ratio";
import { ScrollArea } from "./ui/scroll-area";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-bold text-lg tracking-wide border-b border-gray-200 pb-1 mb-2 mt-8 uppercase">{children}</div>
  );
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  headline?: string;
  location?: string;
  website?: string;
  github?: string;
  summary?: string;
}

export default function ResumePreview() {
  const personal = useResumeStore(s => s.personal) as PersonalInfo;
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);
  const education = useResumeStore(s => s.education);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Only render website, github, summary if they exist
  const website = personal.website;
  const github = personal.github;
  const summary = personal.summary;

  // Ref for the resume content
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setScale(Math.min(width / 800, 1));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto min-w-[800px]">
      <div className="w-full" ref={containerRef}>
        <AspectRatio ratio={1 / 1.4142}>
          <div className="absolute inset-0 bg-white rounded-xl border border-[#ece7df]">
            <ScrollArea className="h-full w-full rounded-xl">
              <div 
                ref={resumeRef} 
                className="p-10 min-w-[800px] origin-top-left"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">{personal?.name}</h1>
          {personal?.headline && (
            <div className="text-gray-600 mb-1">{personal.headline}</div>
          )}
          <div className="text-gray-600 text-sm">
            {personal?.email}
            {personal?.location && personal.email && " • "}
            {personal?.location}
          </div>
        </div>

        {/* Education */}
                {education.length > 0 && (
                  <>
        <SectionHeader>EDUCATION</SectionHeader>
        <div className="flex flex-col gap-2">
          {education.map((edu: any) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  {edu.degree && <span className="font-bold text-sm text-gray-900 uppercase mr-2">{edu.degree}</span>}
                  {edu.institution && <span className="text-sm text-gray-800">{edu.institution}</span>}
                </div>
                <div className="text-[10px] text-right text-gray-600">{edu.year}</div>
              </div>
            </div>
          ))}
        </div>
                  </>
                )}

        {/* Professional Experience */}
                {experiences.length > 0 && (
                  <>
        <SectionHeader>PROFESSIONAL EXPERIENCE</SectionHeader>
        <div className="flex flex-col gap-2">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  {exp.position && <span className="font-bold text-sm text-gray-900 uppercase mr-2">{exp.position}</span>}
                  {exp.company && <span className="text-sm text-gray-800">{exp.company}</span>}
                </div>
                <div className="text-[10px] text-right text-gray-600">
                  {exp.location && <span>{exp.location}, </span>}
                  {exp.dates || exp.duration}
                </div>
              </div>
              {exp.bullets ? (
                <ul className="list-disc ml-6 text-xs text-gray-800 mt-1">
                  {exp.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              ) : exp.description && (
                <ul className="list-disc ml-6 text-xs text-gray-800 mt-1">
                  {exp.description.split('\n').map((line: string, i: number) =>
                    line.trim() && <li key={i}>{line}</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
                  </>
                )}

        {/* Projects */}
                {projects.length > 0 && (
                  <>
        <SectionHeader>PROJECTS</SectionHeader>
        <div className="flex flex-col gap-2">
          {projects.map((project: any) => (
            <div key={project.id} className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <div className="font-bold text-sm text-gray-900">{project.name}</div>
                {project.dates && <div className="text-[10px] text-right text-gray-600">{project.dates}</div>}
              </div>
              {project.bullets ? (
                <ul className="list-disc ml-6 text-xs text-gray-800 mt-1">
                  {project.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              ) : project.description && (
                <ul className="list-disc ml-6 text-xs text-gray-800 mt-1">
                  {project.description.split('\n').map((line: string, i: number) =>
                    line.trim() && <li key={i}>{line}</li>
                  )}
                </ul>
              )}
              {project.tech_stack && (
                <div className="text-[10px] text-gray-600 mt-1">Tech Stack: {project.tech_stack}</div>
              )}
            </div>
          ))}
        </div>
                  </>
                )}

        {/* Skills */}
                {skills.length > 0 && (
                  <>
        <SectionHeader>Skills</SectionHeader>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {skills.map((skill: any) => (
            <span key={skill.id}>{skill.name}</span>
          ))}
        </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </AspectRatio>
      </div>
    </div>
  );
} 