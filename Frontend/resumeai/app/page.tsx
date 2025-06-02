'use client'
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

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
    <main className="min-h-screen w-full bg-[#FCF9F4] flex flex-col relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#D96E36]/10 blur-3xl animate-pulse-slow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#D96E36]/20 blur-2xl animate-pulse-slower" style={{ animationDuration: '14s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-[#D96E36]/5 blur-2xl animate-pulse-slowest" style={{ animationDuration: '20s', transform: 'translate(-50%, -50%)' }} />
      </div>
      {/* Header */}
      <header className="w-full z-10 relative bg-transparent">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#222]">
            <span className="rounded border border-[#ece7df] px-3 py-1 bg-white">T</span>
            <span>Tailyn</span>
          </div>
          <nav className="flex items-center gap-6 md:gap-8 text-base font-medium text-[#222]">
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Product</Link>
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Contact</Link>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="px-4 py-2 text-sm font-medium">Dashboard</Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button variant="outline" className="rounded px-6 py-2 border-[#ece7df] text-[#D96E36] font-semibold">Sign up</Button>
              </SignUpButton>
            )}
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center justify-center gap-12 z-10 relative pt-8 md:pt-16 pb-8">
        {/* Left: Headline & CTA */}
        <div className="flex-1 flex flex-col justify-center items-start max-w-xl w-full lg:pt-0 pt-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6 text-[#222]" style={{ letterSpacing: '-0.03em' }}>
            Craft job-ready<br />resumes in<br />seconds.
          </h1>
          <p className="text-base md:text-lg text-[#666] mb-8 max-w-md leading-relaxed tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            <span className="font-semibold text-[#D96E36]">Tailyn</span> analyzes job descriptions alongside your experience to auto-tailor resumes that actually land interviews.
          </p>
          <SignUpButton mode="modal">
            <Button className="bg-[#D96E36] hover:bg-[#D96E36]/90 text-base px-8 py-3 rounded font-semibold shadow-none">Try Tailyn Free</Button>
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
        {/* Right: Screenshot Responsive */}
        <div className="flex-1 flex justify-center items-center w-full max-w-2xl lg:pt-0 pt-6">
          <div className="w-full max-w-[700px] min-w-[520px] min-h-[520px] aspect-[5/3] flex items-center justify-center lg:max-w-[50vw]">
            <Image
              src="/images/preview4.png"
              alt="Tailyn App Screenshot"
              width={1400}
              height={840}
              className="rounded-2xl border border-[#ece7df] bg-white shadow-none object-contain w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
} 