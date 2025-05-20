import { Card } from "./ui/card";

export default function ResumePreview({ projects, experiences, skills, loading }: any) {
  if (loading) return <div className="text-center text-gray-400">Loading preview...</div>;
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: any) => (
            <span key={skill.id} className="bg-gray-100 rounded px-2 py-1 text-sm">
              {skill.name}
            </span>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-2">Projects</h2>
        <div className="flex flex-col gap-4">
          {projects.map((project: any) => (
            <div key={project.id}>
              <div className="font-semibold">{project.name}</div>
              <div className="text-sm text-gray-600">{project.description}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-2">Experience</h2>
        <div className="flex flex-col gap-4">
          {experiences.map((exp: any) => (
            <div key={exp.id}>
              <div className="font-semibold">{exp.position} @ {exp.company}</div>
              <div className="text-sm text-gray-600">{exp.duration}</div>
              <div className="text-sm">{exp.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 