import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useResumeStore } from "../store/useResumeStore";

export default function SkillsEditor() {
  const skills = useResumeStore(s => s.skills);
  const setSkills = useResumeStore(s => s.setSkills);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, { id: Date.now(), name: newSkill.trim() }]);
      setNewSkill("");
    }
  };

  const removeSkill = (id: number) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill, idx) => (
          <span key={skill.id || idx} className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-sm font-medium">
            {skill.name}
            <button
              type="button"
              className="ml-1 text-gray-400 hover:text-red-500"
              onClick={() => removeSkill(skill.id)}
              aria-label="Remove skill"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          placeholder="Add skill"
        />
        <Button type="button" onClick={addSkill} size="sm">+
        </Button>
      </div>
      {skills.length === 0 && <div className="text-gray-400 text-center">No skills selected.</div>}
    </div>
  );
} 