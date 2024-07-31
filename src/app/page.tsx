import Navbar from '@/components/navbar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
export default async function Home() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="h-svh">
      <Navbar />
    </main>
  );
}
