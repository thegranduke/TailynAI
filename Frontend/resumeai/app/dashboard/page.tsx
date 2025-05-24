"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { fetchDashboardJobs } from "@/lib/fetchDashboardJobs";
import { Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const sidebarLinks = [
  { label: "Resumes", href: "/dashboard" },
  { label: "Saved Matches", href: "#" },
  { label: "Settings", href: "#" },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60 * 60) return `${Math.floor(diff / 60) || 1} min ago`;
  if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function SidebarAccountFooter() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SidebarFooter className="mt-auto border-t border-[#ece7df] bg-[#FFFEFB] p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full group focus:outline-none">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="font-semibold text-[#222] text-sm leading-tight truncate">{user?.fullName}</span>
              <span className="text-xs text-[#666] truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-[#D96E36] ml-2 group-hover:text-[#b85a28]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-lg border border-[#ece7df] bg-white shadow-lg min-w-[220px] p-0">
          <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-[#222] text-sm">{user?.fullName}</div>
              <div className="text-xs text-[#666]">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Account</DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Billing</DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2 text-[#222] hover:bg-[#FCF9F4] cursor-pointer">Notifications</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="px-3 py-2 text-[#D96E36] hover:bg-[#FCF9F4] cursor-pointer"
            onClick={() => signOut()}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

function DashboardSidebar() {
  return (
    <Sidebar className="border-r border-[#ece7df] bg-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ResumeAI</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarLinks.map(link => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarAccountFooter />
    </Sidebar>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    fetchDashboardJobs(user.id)
      .then(setJobs)
      .catch(e => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-x-hidden bg-[#f9f6f1]">
        <DashboardSidebar />
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start min-h-screen">
          <div className="w-full flex justify-start p-4">
            <SidebarTrigger />
          </div>
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight flex-shrink-0">Dashboard</h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button className="bg-[#D96E36] hover:bg-[#D96E36]/80 w-full sm:w-auto">Upload Resume</Button>
                <Button variant="outline" className="w-full sm:w-auto">Upload Job Description</Button>
                <Button variant="outline" className="w-full sm:w-auto">Add Projects/Experience/Skills</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin w-6 h-6 text-[#D96E36]" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : jobs.length === 0 ? (
              <Card className="p-8 text-center text-gray-500 border border-[#ece7df] bg-white">No jobs found. Upload a job description to get started!</Card>
            ) : (
              jobs.map(job => (
                <Card key={job.id} className="flex flex-col md:flex-row md:items-center justify-between border border-[#d1d5db] rounded-xl px-6 py-4 bg-white transition">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-gray-900">{job.title}</span>
                      {job.company && <span className="text-gray-600 text-base font-medium">- {job.company}</span>}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
                    <Link href={`/preview?job_id=${job.id}`} passHref legacyBehavior>
                      <Button variant="outline" className="border-[#D96E36] text-[#D96E36] hover:bg-[#D96E36]/10 w-full sm:w-auto">Preview</Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 