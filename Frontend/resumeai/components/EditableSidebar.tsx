import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import ProjectEditor from "@/components/ProjectEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import SkillsEditor from "@/components/SkillsEditor";

const tabs = ["Projects", "Experience", "Skills"];

export default function EditableSidebar({ projects, experiences, skills, loading }: any) {
  const [activeTab, setActiveTab] = useState("Projects");

  return (
    <Card className="h-full flex flex-col">
      <div className="flex gap-2 border-b p-2">
        {tabs.map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="flex-1"
          >
            {tab}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : activeTab === "Projects" ? (
          <ProjectEditor projects={projects} />
        ) : activeTab === "Experience" ? (
          <ExperienceEditor experiences={experiences} />
        ) : (
          <SkillsEditor skills={skills} />
        )}
      </div>
    </Card>
  );
} 