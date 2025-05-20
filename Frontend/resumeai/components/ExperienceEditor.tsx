import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";

export default function ExperienceEditor({ experiences }: { experiences: any[] }) {
  return (
    <div className="flex flex-col gap-4">
      {experiences.map((exp, idx) => (
        <Card key={exp.id || idx} className="p-4 flex flex-col gap-2">
          <input
            className="border rounded p-2 font-semibold"
            defaultValue={exp.position}
            placeholder="Position"
          />
          <input
            className="border rounded p-2"
            defaultValue={exp.company}
            placeholder="Company"
          />
          <input
            className="border rounded p-2"
            defaultValue={exp.duration}
            placeholder="Duration"
          />
          <Textarea
            className="resize-y"
            defaultValue={exp.description}
            rows={3}
            placeholder="Description"
          />
        </Card>
      ))}
      {experiences.length === 0 && <div className="text-gray-400 text-center">No experiences selected.</div>}
    </div>
  );
} 