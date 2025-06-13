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
    <main className="h-screen w-full bg-[#FCF9F4] flex flex-col relative overflow-hidden">
      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-40 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
      </div>

      {/* Header */}
      <header className="w-full z-10 relative">
        <div className="flex items-center justify-between px-4 md:px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#222]">
            <span>Tailyn</span>
          </div>
          <nav className="flex items-center gap-6 md:gap-8 text-sm font-medium text-[#666]">
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Product</Link>
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-[#D96E36] transition-colors">Contact</Link>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="px-4 py-2 text-sm font-medium">Dashboard</Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button variant="outline" className="rounded-full px-6 py-2 border-[#ece7df] text-[#D96E36] font-medium hover:bg-[#D96E36] hover:text-white transition-all">Sign up</Button>
              </SignUpButton>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center  lg:overflow-y-hidden">
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 z-10 relative py-8 lg:py-0">
          {/* Left: Headline & CTA */}
          <div className="flex-1 flex flex-col items-center lg:items-start justify-center max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-8 text-[#222]" style={{ letterSpacing: '-0.03em' }}>
              Craft job-ready<br />resumes in<br />seconds.
            </h1>
            <p className="text-base md:text-lg text-[#666] mb-10 max-w-xl leading-relaxed tracking-tight" style={{ letterSpacing: '-0.01em' }}>
              <span className="font-semibold text-[#D96E36]">Tailyn</span> analyzes job descriptions alongside your experience to auto-tailor resumes that actually land interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center justify-center lg:justify-start">
              <SignUpButton mode="modal">
                <Button className="bg-[#D96E36] hover:bg-[#D96E36]/90 text-white text-base px-8 py-6 rounded-full font-medium shadow-none w-full sm:w-auto">
                  Try Tailyn Free
                </Button>
              </SignUpButton>
            </div>
          </div>

          {/* Right: Screenshot */}
          <div className="flex-1 flex justify-center items-center w-full max-w-2xl lg:max-w-[50vw] px-4 sm:px-8 lg:px-0">
            <div className="w-full max-w-[700px] min-w-[320px] sm:min-w-[520px] min-h-[320px] sm:min-h-[520px] aspect-[5/3] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D96E36]/5 to-transparent rounded-2xl" />
              <Image
                src="/images/preview5.png"
                alt="Tailyn App Screenshot"
                width={1400}
                height={840}
                className="rounded-2xl border border-[#ece7df] bg-white shadow-none object-contain w-full h-auto relative z-10"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 