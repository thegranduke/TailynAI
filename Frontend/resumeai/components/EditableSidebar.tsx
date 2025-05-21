import { Eye, Download, Share2, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import PersonalEditor from "@/components/PersonalEditor";
import SkillsEditor from "@/components/SkillsEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import ProjectEditor from "@/components/ProjectEditor";

function CollapsibleSidebarCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#ece7df] bg-[#FFFEFB]  rounded-lg mb-2 bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-2 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="font-semibold text-base text-left">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export default function EditableSidebar({ loading }: { loading?: boolean }) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Toolbar row (icons, etc.) */}
      <div className="flex items-center justify-center mb-4 mt-1">
        <div className="flex gap-3 bg-[#FFFEFB] rounded-xl px-4 py-2 border border-[#ece7df]">
          <button className="rounded-full border border-[#e6e1d9] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Preview"><Eye className="w-5 h-5 text-gray-500" /></button>
          <button className="rounded-full border border-[#e6e1d9] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Download"><Download className="w-5 h-5 text-gray-500" /></button>
          <button className="rounded-full border border-[#e6e1d9] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Share"><Share2 className="w-5 h-5 text-gray-500" /></button>
        </div>
      </div>
      <div>
        <div className="font-semibold text-lg mb-2">Personal Info</div>
        <PersonalEditor />
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
        <div className="font-semibold text-lg mb-2">Skills</div>
        <SkillsEditor />
      </div>
      {loading && <div className="text-center text-gray-400">Loading...</div>}
    </div>
  );
} 