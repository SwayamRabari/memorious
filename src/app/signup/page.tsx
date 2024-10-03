'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import GoogleIcon from '@/components/icons/google';
import { ModeToggle } from '@/components/ui/themetoggle';
import { googleLogin } from '@/actions/googleLogin';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

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
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  });
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const toastId = toast.loading('Verifying your information...');

    if (!firstName || !lastName || !email || !password) {
      toast.error('Missing required fields', { id: toastId });
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        toast.success('Verification code sent to email!', { id: toastId });
        setIsOtpSent(true);
      } else {
        const data = await response.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Invalid request', { id: toastId });
    }
  };

  const verifyOTP = async (e: any) => {
    e.preventDefault();

    const toastId = toast.loading('Verifying code...');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          password,
          firstName,
          lastName,
        }),
      });

      if (response.ok) {
        toast.success('Account created successfully!', { id: toastId });
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Invalid request', { id: toastId });
    }
  };
  return (
    <main>
      <div className="formcontainer h-svh w-full flex items-center justify-center">
        <div className="absolute top-5 right-5 hidden sm:block">
          <ModeToggle />
        </div>
        {!isOtpSent ? (
          <Card className="w-[90%] sm:w-80 border-0 sm:border">
            <CardHeader className="w-full">
              <CardTitle className="text-[26px] font-bold">Sign Up</CardTitle>
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
                <Button className="w-full">Continue</Button>
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
        ) : (
          <Card className="w-fit sm:w-fit border-0 sm:border scale-100 xl:scale-105 2xl:scale-125">
            <CardHeader className="w-full">
              <CardTitle className="text-[26px] font-bold">Verify</CardTitle>
              <CardDescription className="font-semibold text-[14px]">
                Enter verification code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              <form onSubmit={verifyOTP} className="w-full flex flex-col gap-3">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  value={otp}
                  onChange={(otp) => {
                    setOtp(otp);
                  }}
                  ref={otpInputRef}
                >
                  <InputOTPGroup className="text-sm">
                    <InputOTPSlot
                      index={0}
                      className="text-base font-semibold"
                    />
                    <InputOTPSlot
                      index={1}
                      className="text-base font-semibold"
                    />
                    <InputOTPSlot
                      index={2}
                      className="text-base font-semibold"
                    />
                    <InputOTPSlot
                      index={3}
                      className="text-base font-semibold"
                    />
                    <InputOTPSlot
                      index={4}
                      className="text-base font-semibold"
                    />
                    <InputOTPSlot
                      index={5}
                      className="text-base font-semibold"
                    />
                  </InputOTPGroup>
                </InputOTP>
                <Button className="w-full">Continue</Button>
              </form>
              <CardDescription
                className="font-semibold text-[14px]"
                onClick={() => setIsOtpSent(!isOtpSent)}
              >
                Back to register
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
