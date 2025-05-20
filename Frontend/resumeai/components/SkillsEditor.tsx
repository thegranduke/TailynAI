import { Card } from "./ui/card";

export default function SkillsEditor({ skills }: { skills: any[] }) {
  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill, idx) => (
        <Card key={skill.id || idx} className="p-2 flex items-center gap-2">
          <input
            className="border rounded p-2 flex-1"
            defaultValue={skill.name}
            // onChange={...}
          />
        </Card>
      ))}
      {skills.length === 0 && <div className="text-gray-400 text-center">No skills selected.</div>}
    </div>
  );
} 