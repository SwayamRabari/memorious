'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { data: session, status }: any = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Status:', status);
    console.log('Session:', session);

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Provider: {session.user.provider}</p>
      <p>User ID: {session.user.id}</p>
    </div>
  );
};

export default Dashboard;
