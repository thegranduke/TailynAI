import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useResumeStore } from "../store/useResumeStore";

export default function EducationEditor() {
  const education = useResumeStore(s => s.education);
  const setEducation = useResumeStore(s => s.setEducation);

  const addEducation = () => {
    setEducation([
      ...education,
      { id: Date.now(), degree: "", institution: "", year: "" },
    ]);
  };

  const updateEducation = (idx: number, field: string, value: string) => {
    setEducation(education.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu));
  };

  return (
    <div className="flex flex-col gap-4">
      {education.map((edu, idx) => (
        <Card key={edu.id || idx} className="p-4 flex flex-col gap-2 border border-[#ece7df] bg-white shadow-none">
          <input
            className="border border-[#ece7df] rounded p-2 font-semibold bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
            value={edu.degree}
            placeholder="Degree"
            onChange={e => updateEducation(idx, "degree", e.target.value)}
          />
          <input
            className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
            value={edu.institution}
            placeholder="Institution"
            onChange={e => updateEducation(idx, "institution", e.target.value)}
          />
          <input
            className="border border-[#ece7df] rounded p-2 bg-[#FCF9F4] focus:outline-none focus:ring-2 focus:ring-[#D96E36]/30"
            value={edu.year}
            placeholder="Year"
            onChange={e => updateEducation(idx, "year", e.target.value)}
          />
        </Card>
      ))}
      <Button type="button" onClick={addEducation} variant="outline" size="sm">+ Add Education</Button>
      {education.length === 0 && <div className="text-gray-400 text-center">No education entries.</div>}
    </div>
  );
} 