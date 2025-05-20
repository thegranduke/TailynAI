import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export default function ReplacePopover({ type, onReplace }: { type: string; onReplace: (item: any) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    // Dynamically import supabase client to avoid SSR issues
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const table = type === "project" ? "projects" : type === "experience" ? "work_experiences" : "skills";
    const { data } = await supabase.from(table).select("*").ilike("name", `%${search}%`);
    setResults(data || []);
    setLoading(false);
  }

  return (
    <div className="relative inline-block">
      <Button variant="outline" onClick={() => setOpen(o => !o)}>
        Replace
      </Button>
      {open && (
        <Card className="absolute z-10 mt-2 w-64 p-4 shadow-lg">
          <input
            className="border rounded p-2 w-full mb-2"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <Button className="mb-2 w-full" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <div className="max-h-40 overflow-y-auto">
            {results.map(item => (
              <div
                key={item.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => {
                  onReplace(item);
                  setOpen(false);
                }}
              >
                {item.name || item.position}
              </div>
            ))}
            {results.length === 0 && !loading && <div className="text-gray-400 text-center">No results</div>}
          </div>
        </Card>
      )}
    </div>
  );
} 