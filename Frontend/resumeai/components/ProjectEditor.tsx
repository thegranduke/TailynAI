import { useState } from "react";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";

export default function ProjectEditor({ projects }: { projects: any[] }) {
  return (
    <div className="flex flex-col gap-4">
      {projects.map((project, idx) => (
        <Card key={project.id || idx} className="p-4 flex flex-col gap-2">
          <input
            className="border rounded p-2 font-semibold"
            defaultValue={project.name}
            // onChange={...}
          />
          <Textarea
            className="resize-y"
            defaultValue={project.description}
            rows={3}
            // onChange={...}
          />
        </Card>
      ))}
      {projects.length === 0 && <div className="text-gray-400 text-center">No projects selected.</div>}
    </div>
  );
} 