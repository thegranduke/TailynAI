import React from "react";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useResumeStore } from "../store/useResumeStore";

export default function ProjectEditor() {
  const projects = useResumeStore(s => s.projects);
  const setProjects = useResumeStore(s => s.setProjects);

  const addProject = () => {
    setProjects([
      ...projects,
      { id: Date.now(), name: "", description: "", link: "" },
    ]);
  };

  const updateProject = (idx: number, field: string, value: string) => {
    setProjects(projects.map((proj, i) => i === idx ? { ...proj, [field]: value } : proj));
  };

  return (
    <div className="flex flex-col gap-4">
      {projects.map((project, idx) => (
        <Card key={project.id || idx} className="p-4 flex flex-col gap-2">
          <input
            className="border rounded p-2 font-semibold"
            value={project.name}
            placeholder="Project Name"
            onChange={e => updateProject(idx, "name", e.target.value)}
          />
          <Textarea
            className="resize-y"
            value={project.description}
            rows={3}
            placeholder="Description"
            onChange={e => updateProject(idx, "description", e.target.value)}
          />
          <input
            className="border rounded p-2"
            value={project.link}
            placeholder="Link (optional)"
            onChange={e => updateProject(idx, "link", e.target.value)}
          />
        </Card>
      ))}
      <Button type="button" onClick={addProject} variant="outline" size="sm">+ Add Project</Button>
      {projects.length === 0 && <div className="text-gray-400 text-center">No projects selected.</div>}
    </div>
  );
} 