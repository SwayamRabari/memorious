'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import GoogleIcon from '@/components/icons/google';
import { ModeToggle } from '@/components/ui/themetoggle';
import { googleLogin } from '@/actions/googleLogin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log(email, name);

    const toastId = toast.loading('Creating account...');

    // email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('Invalid email address', {
        duration: 3000,
        id: toastId,
      });
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long', {
        duration: 3000,
        id: toastId,
      });
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Response: ', data);

      if (response.ok) {
        toast.success('Account created successfully', {
          duration: 2000,
          id: toastId,
        });
        router.push('/login');
      } else {
        toast.error(data.error, {
          duration: 3000,
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Error creating account', {
        duration: 3000,
        id: toastId,
      });
    }
  };
  return (
    <main>
      <div className="formcontainer h-svh w-full flex items-center justify-center">
        <div className="absolute top-5 right-5 hidden sm:block">
          <ModeToggle />
        </div>
        <Card className="w-80 border-0 sm:border">
          <CardHeader>
            <CardTitle className="text-[26px] font-bold">Memorious</CardTitle>
            <CardDescription className="font-semibold text-[14px]">
              Create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center">
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3"
            >
              <Input
                placeholder="First Name"
                type="text"
                required
                name="firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last Name"
                type="text"
                required
                name="lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                required
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
                  {showPassword ? (
                    <EyeNoneIcon className="color-" />
                  ) : (
                    <EyeOpenIcon />
                  )}
                </button>
              </div>
              <Button className="w-full">Sign Up</Button>
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
              <Link href={'/login'}>Already have an account? Login</Link>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
