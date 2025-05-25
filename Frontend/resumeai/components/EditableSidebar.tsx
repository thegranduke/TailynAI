import { Eye, Download, Share2, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import PersonalEditor from "@/components/PersonalEditor";
import SkillsEditor from "@/components/SkillsEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import ProjectEditor from "@/components/ProjectEditor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import { useResumeStore } from "../store/useResumeStore";
import EducationEditor from "@/components/EducationEditor";

function CollapsibleSidebarCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#ece7df] bg-[#FFFEFB] rounded-lg mb-4">
      <button
        className="w-full flex items-center justify-between px-4 py-3 focus:outline-none bg-[#FFFEFB] rounded-t-lg"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="font-semibold text-base text-[#222] text-left tracking-tight">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-[#666]" /> : <ChevronRight className="w-4 h-4 text-[#666]" />}
      </button>
      {open && <div className="px-6 pb-4 pt-2">{children}</div>}
    </div>
  );
}

export default function EditableSidebar({ loading, hideGoToDashboard = false }: { loading?: boolean, hideGoToDashboard?: boolean }) {
  const personal = useResumeStore(s => s.personal);
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);
  const education = useResumeStore(s => s.education);
  return (
    <div
      className="flex flex-col gap-6 w-full h-full bg-[#FFFEFB] p-4 pt-14 overflow-y-auto scrollbar-thin scrollbar-thumb-[#ece7df] scrollbar-track-[#FCF9F4] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
      style={{
        scrollbarColor: '#ece7df #FCF9F4',
        scrollbarWidth: 'thin',
      }}
    >
      {/* Toolbar row (icons, etc.) */}
      <div className="flex items-center justify-center mb-2 mt-1">
        <PDFDownloadLink
          document={
            <ResumePDF
              personal={{ ...personal }}
              skills={skills.map(s => ({ id: s.id, name: s.name }))}
              experiences={experiences.map(e => ({
                id: e.id,
                position: e.position,
                company: e.company,
                duration: e.duration,
                description: e.description,
                // add other serializable fields if needed
              }))}
              projects={projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                // add other serializable fields if needed
              }))}
              education={education.map(edu => ({
                id: edu.id,
                degree: edu.degree,
                institution: edu.institution,
                year: edu.year,
              }))}
            />
          }
          fileName={`${personal.name ? personal.name.replace(/\s+/g, '_') : 'resume'}.pdf`}
        >
          {({ loading }) => (
            <Button
              className="bg-[#D96E36] hover:bg-[#D96E36]/90 text-white font-semibold rounded px-6 py-2"
              disabled={loading}
            >
              {loading ? "Preparing PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <div>
        <div className="font-semibold text-lg mb-2 text-[#222] tracking-tight">Personal Info</div>
        <PersonalEditor />
      </div>
      <div>
        <CollapsibleSidebarCard title="Education" defaultOpen={false}>
          <EducationEditor />
        </CollapsibleSidebarCard>
      </div>
      <div>
        <CollapsibleSidebarCard title="Work Experience">
          <ExperienceEditor />
        </CollapsibleSidebarCard>
      </div>
      <div>
        <CollapsibleSidebarCard title="Projects">
          <ProjectEditor />
        </CollapsibleSidebarCard>
      </div>
      <div>
        <div className="font-semibold text-lg mb-2 text-[#222] tracking-tight">Skills</div>
        <SkillsEditor />
      </div>
      {loading && <div className="text-center text-[#666] text-sm">Loading...</div>}
      {/* Go to Dashboard Button */}
      {!hideGoToDashboard && (
        <div className="mt-auto pt-4">
          <Link href="/dashboard" passHref legacyBehavior>
            <Button className="w-full bg-[#D96E36] hover:bg-[#D96E36]/90 text-white font-semibold rounded">Go to Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 