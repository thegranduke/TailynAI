import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#FFFEFB] border-b border-[#ece7df] py-3 px-6 flex justify-between items-center w-full sticky top-0 z-50">
      <div className="font-bold text-[#222] text-xl tracking-tight">Tailyn</div>
      <nav className="flex gap-6">
        <Link href="/dashboard" className="text-[#222] hover:text-[#D96E36] font-medium">Dashboard</Link>
        {/* <Link href="/preview" className="text-[#222] hover:text-[#D96E36] font-medium">Preview</Link> */}
      </nav>
    </header>
  );
} 