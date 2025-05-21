import React from "react";
import { useResumeStore } from "../store/useResumeStore";

export default function ResumePreview() {
  const personal = useResumeStore(s => s.personal);
  const skills = useResumeStore(s => s.skills);
  const experiences = useResumeStore(s => s.experiences);
  const projects = useResumeStore(s => s.projects);

  return (
    <div className="prose max-w-none mx-auto">
      <h1 className="mb-0">{personal.name}</h1>
      <div className="text-lg font-medium -mt-2 mb-2">Data Scientist</div>
      <div className="text-sm text-gray-600 mb-4">{personal.email}<br />{personal.phone}</div>
      <h2>Skills</h2>
      <ul className="flex flex-wrap gap-2 list-none p-0 mb-6">
        {skills.map((skill: any) => (
          <li key={skill.id} className="bg-gray-100 rounded px-2 py-1 text-sm font-medium">
            {skill.name}
          </li>
        ))}
      </ul>
      <h2>Work Experience</h2>
      <div className="mb-6">
        {experiences.map((exp: any) => (
          <div key={exp.id} className="mb-4">
            <div className="font-semibold text-base">{exp.position} <span className="text-gray-500 font-normal">@ {exp.company}</span></div>
            <div className="text-xs text-gray-500 mb-1">{exp.duration}</div>
            <div className="text-sm whitespace-pre-line">{exp.description}</div>
          </div>
        ))}
      </div>
      <h2>Projects</h2>
      <div>
        {projects.map((project: any) => (
          <div key={project.id} className="mb-4">
            <div className="font-semibold text-base">{project.name}</div>
            <div className="text-sm whitespace-pre-line">{project.description}</div>
            {project.link && (
              <div className="text-xs text-blue-600"><a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 