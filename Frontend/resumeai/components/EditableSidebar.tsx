import { Card } from "./ui/card";
import PersonalEditor from "@/components/PersonalEditor";
import SkillsEditor from "@/components/SkillsEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import ProjectEditor from "@/components/ProjectEditor";

export default function EditableSidebar({ loading }: { loading?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <PersonalEditor />
      </Card>
      <Card className="p-4">
        <SkillsEditor />
      </Card>
      <Card className="p-4">
        <ExperienceEditor />
      </Card>
      <Card className="p-4">
        <ProjectEditor />
      </Card>
      {loading && <div className="text-center text-gray-400">Loading...</div>}
    </div>
  );
} 