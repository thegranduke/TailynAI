import { create } from 'zustand';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

interface Skill {
  id: number;
  name: string;
}

interface Experience {
  id: number;
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  link?: string;
}

interface ResumeState {
  personal: PersonalInfo;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  setPersonal: (personal: PersonalInfo) => void;
  setSkills: (skills: Skill[]) => void;
  setExperiences: (experiences: Experience[]) => void;
  setProjects: (projects: Project[]) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  personal: {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '(123) 456-7890',
  },
  skills: [],
  experiences: [],
  projects: [],
  setPersonal: (personal) => set({ personal }),
  setSkills: (skills) => set({ skills }),
  setExperiences: (experiences) => set({ experiences }),
  setProjects: (projects) => set({ projects }),
})); 