import Link from 'next/link';
import Logo from './ui/logo';
import { ModeToggle } from '@/components/ui/themetoggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-5 border-b-2 border-secondary w-full fixed top-0 left-0 bg-background transition-all duration-300">
      <Logo />
      <menu className="flex gap-5 items-center text-[16px] font-semibold">
        <Link
          className="rounded-md h-10 hidden md:flex items-center border-2 border-secondary justify-center px-4"
          href={'/signup'}
        >
          Sign Up
        </Link>
        <Link
          className=" 
        bg-secondary rounded-md h-10 flex items-center justify-center px-4"
          href={'/login'}
        >
          Login
        </Link>
        <div className="hidden md:flex">
          <ModeToggle />
        </div>
      </menu>
    </nav>
  );
}
