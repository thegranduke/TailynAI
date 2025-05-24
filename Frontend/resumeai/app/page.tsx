'use client'
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";

// Example university logos (replace with real logos as needed)
const universities = [
  { name: "Harvard", src: "/logos/harvard.svg" },
  { name: "MIT", src: "/logos/georgia.svg" },
  { name: "Stanford", src: "/logos/uct.svg" },
  { name: "Oxford", src: "/logos/harvard.svg" },
  { name: "Cambridge", src: "/logos/uj.svg" },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();
  return (
    <main className="min-h-screen bg-[#FCF9F4] flex flex-col relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#D96E36]/10 blur-3xl animate-pulse-slow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#D96E36]/20 blur-2xl animate-pulse-slower" style={{ animationDuration: '14s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-[#D96E36]/5 blur-2xl animate-pulse-slowest" style={{ animationDuration: '20s', transform: 'translate(-50%, -50%)' }} />
      </div>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto z-10 relative">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span className="rounded border border-[#ece7df] px-2 py-1">R</span>
          <span>ResumeAI</span>
        </div>
        <nav className="flex items-center gap-8 text-base font-medium text-gray-700">
          <Link href="#" className="hover:text-[#D96E36]">Product</Link>
          <Link href="#" className="hover:text-[#D96E36]">Pricing</Link>
          <Link href="#" className="hover:text-[#D96E36]">Contact</Link>
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="px-4 py-2 text-sm font-medium">Dashboard</Button>
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <Button variant="outline" className="rounded px-6 py-2">Sign up</Button>
            </SignUpButton>
          )}
        </nav>
      </header>
      {/* Main Content */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto px-8 gap-8 z-10 relative">
        {/* Left: Headline & CTA */}
        <div className="flex-1 flex flex-col justify-center items-start max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6 text-gray-900" style={{ letterSpacing: '-0.03em' }}>
            Craft job-ready<br />resumes in<br />seconds.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md leading-relaxed tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            <span className="font-semibold">ResumeAI</span> analyzes job descriptions alongside your experience to auto-tailor resumes that actually land interviews.
          </p>
          <SignUpButton mode="modal">
            <Button className="bg-[#D96E36] hover:bg-[#D96E36]/90 text-lg px-8 py-4 rounded font-semibold shadow-md">Try ResumeAI Free</Button>
          </SignUpButton>
          {/* Ticker with university logos */}
          {/* <div className="w-full mt-8 flex flex-col items-center">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Trusted by students at</div>
            <div className="flex gap-6 items-center overflow-x-auto pb-2">
              {universities.map(u => (
                <img key={u.name} src={u.src} alt={u.name} className="h-7 w-auto grayscale opacity-80" />
              ))}
            </div>
          </div> */}
        </div>
        {/* Right: Browser Mockup */}
        <div className="flex-1 flex justify-center items-center w-full max-w-2xl ">
          <div className="rounded-2xl border border-gray-900 bg-white shadow-sm w-full max-w-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ece7df] bg-[#f9f6f1]">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div className="w-3 h-3 rounded-full bg-gray-500" />
            </div>
            <div className="flex flex-col md:flex-row border-t border-gray-900">
              {/* Input area (sidebar) */}
              <div className="flex flex-col gap-5 p-8 w-full max-w-xs min-w-[240px] border-r border-[#ece7df] bg-[#FCF9F4]">
                <div>
                  <div className="text-xs font-semibold mb-1 text-gray-700">Job description</div>
                  <input
                    className="w-full border border-[#ece7df] rounded px-2 py-1 text-sm bg-white"
                    value="Software Engineer"
                    readOnly
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1 text-gray-700">Skills</div>
                  <select className="w-full border border-[#ece7df] rounded px-2 py-1 text-sm bg-white" value="Python" disabled>
                    <option>Python</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1 text-gray-700">Experience</div>
                  <input
                    className="w-full border border-[#ece7df] rounded px-2 py-1 text-sm bg-white"
                    value="Software"
                    readOnly
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1 text-gray-700">Resume</div>
                  <div className="h-4 border-b border-[#ece7df] w-2/3 mt-1" />
                </div>
              </div>
              {/* Resume preview area */}
              <div className="flex-1 p-8 flex flex-col gap-2 min-w-[260px]">
                <div className="text-2xl font-bold mb-1">Olivia Carter</div>
                <div className="text-sm text-gray-700 mb-1">olivia-carter@email.com · 510-555-5555<br />Oakland, CA</div>
                <div className="font-semibold text-lg mt-2 mb-1">Professional Experience</div>
                <div className="mb-2">
                  <div className="font-semibold text-base">Acme Inc.</div>
                  <div className="text-xs text-gray-500 mb-1">2020—2023</div>
                  <ul className="list-disc ml-5 text-sm text-gray-800">
                    <li>Develop end-e-end web applications</li>
                    <li>Collaborate with product managers to design and implement new features</li>
                    <li>Identify and resolve performance issues</li>
                    <li>Write unit tests to validate code for robustness</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-base">Software Developer</div>
                  <div className="text-xs text-gray-500 mb-1">2020—2023</div>
                  <ul className="list-disc ml-5 text-sm text-gray-800">
                    <li>Develop a credit-end web application</li>
                    <li>Selek and management of team's workflow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 