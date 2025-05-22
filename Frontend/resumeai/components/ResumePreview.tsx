import React, { useRef } from "react";
import { useResumeStore } from "../store/useResumeStore";
import ResumePDF from "./ResumePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-bold text-lg tracking-wide border-b border-gray-200 pb-1 mb-2 mt-8 uppercase">{children}</div>
  );
}

export default function ResumePreview() {
  const personal = useResumeStore(s => s.personal);
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);

  // Only render website, github, summary if they exist
  const website = (personal as any).website;
  const github = (personal as any).github;
  const summary = (personal as any).summary;

  // Ref for the resume content
  const resumeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-2xl">
      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <PDFDownloadLink
          document={<ResumePDF personal={personal} skills={skills} experiences={experiences} projects={projects} />}
          fileName={`${personal.name ? personal.name.replace(/\s+/g, '_') : 'resume'}.pdf`}
        >
          {({ loading }) => (
            <button
              className="px-4 py-2 bg-[#D96E36] text-white rounded hover:bg-[#D96E36]/80 transition"
              disabled={loading}
            >
              {loading ? "Preparing PDF..." : "Download PDF"}
            </button>
          )}
        </PDFDownloadLink>
      </div>
      <div ref={resumeRef} className="bg-white rounded-xl border border-[#ece7df] shadow-sm p-10">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="text-3xl font-light mb-1">{personal.name || ""}</div>
          <div className="flex flex-col items-center justify-center text-sm text-gray-700 mb-2 gap-1">
            <div className="flex flex-wrap justify-center gap-2">
              {personal.email && <span className="flex items-center gap-1"><span className="text-base">✉️</span> {personal.email}</span>}
              {website && <span className="flex items-center gap-1"><span className="text-base">🌐</span> {website}</span>}
              {github && <span className="flex items-center gap-1"><span className="text-base">github.com</span> {github}</span>}
            </div>
            {personal.phone && <div>{personal.phone}</div>}
          </div>
          {summary && (
            <div className="italic text-xs text-gray-500 mb-2">{summary}</div>
          )}
        </div>

        {/* Professional Experience */}
        <SectionHeader>Professional Experience</SectionHeader>
        <div className="flex flex-col gap-2">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  {exp.position && <span className="uppercase text-xs font-semibold text-gray-700 mr-2">{exp.position}</span>}
                  {exp.company && <span className="text-base text-gray-900">{exp.company}</span>}
                </div>
                <div className="text-xs text-right text-gray-500">
                  {exp.location && <span>{exp.location}, </span>}
                  {exp.dates || exp.duration}
                </div>
              </div>
              {exp.bullets ? (
                <ul className="list-disc ml-6 text-sm mt-1">
                  {exp.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              ) : exp.description && (
                <ul className="list-disc ml-6 text-sm mt-1">
                  {exp.description.split('\n').map((line: string, i: number) =>
                    line.trim() && <li key={i}>{line}</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Projects */}
        <SectionHeader>Projects</SectionHeader>
        <div className="flex flex-col gap-2">
          {projects.map((project: any) => (
            <div key={project.id} className="mb-2">
              <div className="font-bold text-base mb-1">{project.name}</div>
              {project.bullets ? (
                <ul className="list-disc ml-6 text-sm mt-1">
                  {project.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              ) : project.description && (
                <ul className="list-disc ml-6 text-sm mt-1">
                  {project.description.split('\n').map((line: string, i: number) =>
                    line.trim() && <li key={i}>{line}</li>
                  )}
                </ul>
              )}
              {project.tech_stack && (
                <div className="text-xs text-gray-500 mt-1">Tech Stack: {project.tech_stack}</div>
              )}
            </div>
          ))}
        </div>

        {/* Skills */}
        <SectionHeader>Skills</SectionHeader>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {skills.map((skill: any) => (
            <span key={skill.id}>{skill.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
} 