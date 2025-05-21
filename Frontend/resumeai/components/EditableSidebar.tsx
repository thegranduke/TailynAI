import PersonalEditor from "@/components/PersonalEditor";
import SkillsEditor from "@/components/SkillsEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import ProjectEditor from "@/components/ProjectEditor";

export default function EditableSidebar({ loading }: { loading?: boolean }) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Toolbar row (icons, etc.) */}
      <div className="flex items-center gap-4 mb-2">
        <button className="rounded-lg p-2 hover:bg-[#ece7df] text-gray-500" title="Preview"><span role="img" aria-label="preview">🗎</span></button>
        <button className="rounded-lg p-2 hover:bg-[#ece7df] text-gray-500" title="Download"><span role="img" aria-label="download">⇩</span></button>
        <button className="rounded-lg p-2 hover:bg-[#ece7df] text-gray-500" title="Share"><span role="img" aria-label="share">⇪</span></button>
      </div>
      <div>
        <div className="font-semibold text-lg mb-2">Personal Info</div>
        <PersonalEditor />
      </div>
      <div>
        <div className="font-semibold text-lg mb-2">Work Experience</div>
        <ExperienceEditor />
      </div>
      <div>
        <div className="font-semibold text-lg mb-2">Projects</div>
        <ProjectEditor />
      </div>
      <div>
        <div className="font-semibold text-lg mb-2">Skills</div>
        <SkillsEditor />
      </div>
      {loading && <div className="text-center text-gray-400">Loading...</div>}
    </div>
  );
} 