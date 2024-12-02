import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between px-6 py-6">
      <h1 className="text-[25px] font-bold">Memorious</h1>
      <menu className="flex gap-5 items-center">
        <Link
          className="text-[16px] font-semibold bg-background border border-border rounded-md h-10 px-4 py-2 hover:bg-accent transition-all duration-200"
          href={'/signup'}
        >
          Sign Up
        </Link>
        <Link
          className="text-[16px] font-semibold 
          bg-secondary rounded-md h-10 px-4 py-2 
          hover:bg-secondary/80 transition-all"
          href={'/login'}
        >
          Login
        </Link>
      </menu>
    </nav>
  );
}
