"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ResumeAI</h1>
        <Card className="p-6 flex flex-col gap-4">
          <Link href="/upload-resume">
            <button className="w-full py-2 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition">Upload Resume</button>
          </Link>
          <Link href="/manual-entry">
            <button className="w-full py-2 px-4 rounded bg-secondary text-secondary-foreground hover:bg-secondary/90 transition">Manually Add Experience</button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
