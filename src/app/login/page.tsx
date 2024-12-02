'use client';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import GoogleIcon from '@/components/icons/google';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { googleLogin } from '@/actions/googleLogin';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const toastId = toast.loading('Signing in...');

    if (typeof email !== 'string' || typeof password !== 'string') {
      toast.error('Invalid input: email and password must be strings', {
        duration: 3000,
        id: toastId,
      });
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error('Invalid email or password', {
          duration: 3000,
          id: toastId,
        });
        console.error('Error processing request:', result.error);
      } else {
        toast.success('Signed in successfully!', {
          duration: 2000,
          id: toastId,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('An error occurred. Please try again later.', {
        duration: 3000,
        id: toastId,
      });
    }
  };

  return (
    <main>
      <div className="relative formcontainer h-svh w-full flex items-center justify-center">
        <div className="absolute top-5 right-5 hidden sm:block">
          <ModeToggle />
        </div>
        <Card className="w-[90%] sm:w-80 border-0 sm:border">
          <CardHeader className="w-full">
            <CardTitle className="text-[26px] font-bold">Login</CardTitle>
            <CardDescription className="font-semibold text-[14px]">
              Login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center">
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
              <Input
                placeholder="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="password relative flex items-center">
                <Input
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 py-2 px-2 mx-1 bg-background"
                >
                  {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <CardDescription className="font-semibold text-[14px] w-full text-center">
                <Link href={'/reset-password'}>Forgot password? Reset it</Link>
              </CardDescription>
            </form>
            <div className="relative my-3 w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border" />
              </div>
              <div className="relative flex justify-center text-xs font-medium">
                <span className="bg-background px-3 text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>
            <form action={googleLogin} className="w-full">
              <Button variant={'secondary'} className="w-full flex gap-2">
                <GoogleIcon />
                Google
              </Button>
            </form>
            <CardDescription className="font-semibold text-[14px]">
              <Link href={'/signup'}>Do not have an account? Sign Up</Link>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
