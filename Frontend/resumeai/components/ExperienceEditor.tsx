import React from "react";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useResumeStore } from "../store/useResumeStore";

export default function ExperienceEditor() {
  const experiences = useResumeStore(s => s.experiences);
  const setExperiences = useResumeStore(s => s.setExperiences);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now(), position: "", company: "", duration: "", description: "" },
    ]);
  };

  const updateExperience = (idx: number, field: string, value: string) => {
    setExperiences(experiences.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  return (
    <div className="flex flex-col gap-4">
      {experiences.map((exp, idx) => (
        <Card key={exp.id || idx} className="p-4 flex flex-col gap-2">
          <input
            className="border rounded p-2 font-semibold"
            value={exp.position}
            placeholder="Position"
            onChange={e => updateExperience(idx, "position", e.target.value)}
          />
          <input
            className="border rounded p-2"
            value={exp.company}
            placeholder="Company"
            onChange={e => updateExperience(idx, "company", e.target.value)}
          />
          <input
            className="border rounded p-2"
            value={exp.duration}
            placeholder="Duration"
            onChange={e => updateExperience(idx, "duration", e.target.value)}
          />
          <Textarea
            className="resize-y"
            value={exp.description}
            rows={3}
            placeholder="Description"
            onChange={e => updateExperience(idx, "description", e.target.value)}
          />
        </Card>
      ))}
      <Button type="button" onClick={addExperience} variant="outline" size="sm">+ Add Experience</Button>
      {experiences.length === 0 && <div className="text-gray-400 text-center">No experiences selected.</div>}
    </div>
  );
} 