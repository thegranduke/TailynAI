"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";

interface CreateResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: any[];
  experiences: any[];
}

export function CreateResumeDialog({ open, onOpenChange, projects, experiences }: CreateResumeDialogProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    jobDescription: ""
  });

  const hasContent = projects.length > 0 || experiences.length > 0;

  const handleCreateResume = async (withTailyn: boolean = false) => {
    if (!formData.title.trim() || !formData.company.trim()) {
      toast.error("Please enter both job title and company name");
      return;
    }

    const token = await getToken();
    setLoading(true);
    try {
      // First create a new job
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          company: formData.company.trim(),
          jobDescription: withTailyn ? formData.jobDescription.trim() : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create job');
      }

      const data = await response.json();
      const job_id = data.id;

      // Only do matching if using Tailyn
      if (withTailyn) {
        if (!formData.jobDescription.trim()) {
          toast.error("Please enter a job description");
          return;
        }

        if (!hasContent) {
          toast.error("You need some projects or experiences to use Tailyn. Add some first!");
          return;
        }

        // Match job description
        const matchResponse = await fetch('/api/match-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            job_description: formData.jobDescription.trim(),
            job_id
          }),
        });

        if (!matchResponse.ok) {
          const errorData = await matchResponse.json().catch(() => ({}));
          console.error('Match job failed:', {
            status: matchResponse.status,
            statusText: matchResponse.statusText,
            error: errorData
          });
          throw new Error(`Failed to match job: ${matchResponse.status} ${matchResponse.statusText}`);
        }

        const matchData = await matchResponse.json();
        console.log('Match successful:', matchData);
      }

      // Save initial resume state
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      await supabase
        .from('resume_states')
        .upsert({
          job_id: parseInt(job_id),
          profile_id: user?.id,
          personal: {
            title: formData.title.trim(),
            company: formData.company.trim()
          },
          updated_at: new Date().toISOString()
        });

      // Redirect to preview page
      router.push(`/preview?job_id=${job_id}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleCreateResume:', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center">Create New Resume</DialogTitle>
          <DialogDescription className="text-center text-[#666]">
            Enter job details to create a new resume or let Tailyn help you match your experience
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateResume(true); }} className="overflow-y-auto">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Google"
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="jobDescription">Job Description</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-[#666] italic">
                        {hasContent 
                          ? "Required for Tailyn matching" 
                          : "Add projects or experience first to use Tailyn"
                        }
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {hasContent 
                          ? "Add a job description to let Tailyn suggest relevant experiences and projects" 
                          : "You need to add some projects or work experience before using Tailyn"
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder={hasContent 
                  ? "Paste the job description here to let Tailyn match your experiences..." 
                  : "Add some projects or work experience first to use Tailyn matching..."
                }
                className="min-h-[200px] resize-y"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="sm:order-1"
            >
              Cancel
            </Button>
            <div className="flex gap-2 sm:order-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleCreateResume(false)}
                    >
                      Build Resume
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create an empty resume to fill out manually</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      className={`${hasContent ? 'bg-[#D96E36] hover:bg-[#b85a28]' : 'bg-gray-400 cursor-not-allowed'}`}
                      disabled={loading || !hasContent}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Use Tailyn
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {hasContent 
                        ? "Let Tailyn automatically match and populate your resume based on the job description" 
                        : "Add some projects or work experience first to use Tailyn"
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ImportResumeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import resume");
      }

      toast.success("Resume parsed successfully! Your profile has been updated.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Import Existing Resume</DialogTitle>
          <DialogDescription className="text-center text-[#666]">
            Upload your existing resume in PDF format
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Resume File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Resume"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 