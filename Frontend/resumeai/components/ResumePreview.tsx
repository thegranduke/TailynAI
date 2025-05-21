import React from "react";
import { useResumeStore } from "../store/useResumeStore";

export default function ResumePreview() {
  const personal = useResumeStore(s => s.personal);
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl border border-[#ece7df] shadow-sm p-10">
        <div className="mb-6">
          <div className="text-3xl font-bold mb-1">{personal.name || ""}</div>
          <div className="text-lg mb-2">Data Scientist</div>
          <div className="text-base text-gray-700 mb-1">{personal.email || ""}</div>
          <div className="text-base text-gray-700">{personal.phone || ""}</div>
        </div>
        <div className="mb-6">
          <div className="font-semibold text-xl mb-2">Skills</div>
          <ul className="list-none p-0 m-0 space-y-1">
            {skills.map((skill: any) => (
              <li key={skill.id} className="text-base">{skill.name}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <div className="font-semibold text-xl mb-2">Work Experience</div>
          {experiences.map((exp: any) => (
            <div key={exp.id} className="mb-4">
              <div className="font-semibold text-base">{exp.position}</div>
              <div className="text-base text-gray-700 mb-1">{exp.company}</div>
              <div className="text-base text-gray-700 mb-1">{exp.duration}</div>
              <div className="text-base whitespace-pre-line">{exp.description}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="font-semibold text-xl mb-2">Projects</div>
          {projects.map((project: any) => (
            <div key={project.id} className="mb-4">
              <div className="font-semibold text-base">{project.name}</div>
              <div className="text-base whitespace-pre-line">{project.description}</div>
              {project.link && (
                <div className="text-xs text-blue-600"><a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 