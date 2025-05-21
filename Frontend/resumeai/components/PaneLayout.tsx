import React from "react";

interface PaneLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function PaneLayout({ left, right }: PaneLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f9f6f2] flex justify-center items-start">
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] w-full max-w-6xl min-h-screen">
        <div className="bg-[#f7f5f2] h-full p-8 border-r border-[#ece7df] flex flex-col">
          {left}
        </div>
        <div className="bg-transparent h-full p-8 flex flex-col items-center justify-start">
          {right}
        </div>
      </div>
    </div>
  );
} 