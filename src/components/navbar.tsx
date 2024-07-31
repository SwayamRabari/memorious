import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between px-6 py-6">
      <h1 className="text-[25px] font-bold">Memorious</h1>
      <menu className="flex gap-5 items-center">
        <Button variant={'outline'}>
          <Link className="text-[16px] font-semibold" href={'/signup'}>
            Sign Up
          </Link>
        </Button>
        <Button variant={'secondary'}>
          <Link className="text-[16px] font-semibold" href={'/login'}>
            Login
          </Link>
        </Button>
      </menu>
    </nav>
  );
}
