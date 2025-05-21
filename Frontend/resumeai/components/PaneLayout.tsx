import React from "react";

interface PaneLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function PaneLayout({ left, right }: PaneLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FDF9F4] flex">
      <div className="w-2/5 min-w-[320px] max-w-lg bg-[#FDF9F4] h-full p-6 border-r border-[#e6e1d9] flex flex-col">
        {left}
      </div>
      <div className="flex-1 bg-[#FCF9F4] h-full p-10 flex flex-col items-center justify-start overflow-auto">
        {right}
      </div>
    </div>
  );
} 