'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Sending reset code...');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Reset code sent to your email', { id: toastId });
        setStep(2);
      } else {
        const data = await response.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to send reset code', { id: toastId });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Verifying OTP...');

    try {
      const response = await fetch('/api/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        toast.success('OTP verified', { id: toastId });
        setStep(3);
      } else {
        const data = await response.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to verify OTP', { id: toastId });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Resetting password...');

    try {
      const response = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (response.ok) {
        toast.success('Password reset successfully', { id: toastId });
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to reset password', { id: toastId });
    }
  };

  return (
    <main>
      <div className="relative formcontainer h-svh w-full flex items-center justify-center">
        {step === 1 && (
          <Card className="w-[90%] sm:w-80 border-0 sm:border">
            <CardHeader className="w-full">
              <CardTitle className="text-[26px] font-bold">
                Reset Password
              </CardTitle>
              <CardDescription className="font-semibold text-[14px]">
                Enter your email to reset password
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              <form
                onSubmit={handleSendResetEmail}
                className="w-full flex flex-col gap-3"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={!email}>
                  Send Reset Code
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-fit sm:w-fit border-0 sm:border">
            <CardHeader className="w-full">
              <CardTitle className="text-[26px] font-bold">
                Verify Code
              </CardTitle>
              <CardDescription className="font-semibold text-[14px]">
                Enter the code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              <form
                onSubmit={handleVerifyOtp}
                className="w-full flex flex-col gap-3"
              >
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otp.length !== 6}
                >
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="w-fit sm:w-fit border-0 sm:border">
            <CardHeader className="w-full">
              <CardTitle className="text-[26px] font-bold">
                Reset Password
              </CardTitle>
              <CardDescription className="font-semibold text-[14px]">
                Enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              <form
                onSubmit={handleResetPassword}
                className="w-full flex flex-col gap-3"
              >
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!newPassword}
                >
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
