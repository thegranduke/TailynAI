import React from "react";

interface PaneLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function PaneLayout({ left, right }: PaneLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-screen">
      <div className="bg-muted h-full overflow-y-auto p-6 border-r">
        {left}
      </div>
      <div className="bg-white h-full overflow-y-auto p-8">
        {right}
      </div>
    </div>
  );
} 