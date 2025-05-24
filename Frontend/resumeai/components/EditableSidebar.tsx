import { Eye, Download, Share2, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import PersonalEditor from "@/components/PersonalEditor";
import SkillsEditor from "@/components/SkillsEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import ProjectEditor from "@/components/ProjectEditor";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex flex-col gap-6 w-full h-full bg-[#FFFEFB] p-4">
      {/* Toolbar row (icons, etc.) */}
      <div className="flex items-center justify-center mb-2 mt-1">
        <div className="flex gap-3 bg-[#FFFEFB] rounded-xl px-4 py-2 border border-[#ece7df]">
          <button className="rounded-full border border-[#ece7df] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Preview"><Eye className="w-5 h-5 text-[#666]" /></button>
          <button className="rounded-full border border-[#ece7df] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Download"><Download className="w-5 h-5 text-[#666]" /></button>
          <button className="rounded-full border border-[#ece7df] bg-white p-2 w-9 h-9 flex items-center justify-center hover:bg-[#f0ede7] transition" title="Share"><Share2 className="w-5 h-5 text-[#666]" /></button>
        </div>
      </div>
      <div>
        <div className="font-semibold text-lg mb-2 text-[#222] tracking-tight">Personal Info</div>
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