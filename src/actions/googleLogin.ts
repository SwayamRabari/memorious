import { signIn } from 'next-auth/react';

export const googleLogin = async () => {
  try {
    await signIn('google', { callbackUrl: '/dashboard' });
  } catch (error) {
    console.log('Error processing request:', error);
  }
};
