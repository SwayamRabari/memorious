import Link from 'next/link';
import Logo from './ui/logo';
import { ModeToggle } from '@/components/ui/themetoggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
      <Logo />
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
        <ModeToggle />
      </menu>
    </nav>
  );
}
