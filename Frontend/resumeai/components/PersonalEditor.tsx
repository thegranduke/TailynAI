import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useResumeStore } from "../store/useResumeStore";

export default function PersonalEditor() {
  const personal = useResumeStore(s => s.personal);
  const setPersonal = useResumeStore(s => s.setPersonal);

  return (
    <form className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          className="bg-[#FFFEFB]"
          value={personal.name || ""}
          onChange={e => setPersonal({ ...personal, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          className="bg-[#FFFEFB]"
          value={personal.email || ""}
          onChange={e => setPersonal({ ...personal, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          className="bg-[#FFFEFB]"
          value={personal.phone || ""}
          onChange={e => setPersonal({ ...personal, phone: e.target.value })}
        />
      </div>
    </form>
  );
} 