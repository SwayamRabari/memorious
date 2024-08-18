import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (!data.email || !data.otp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // verify otp
    const existingOtp = await prisma.otp.findFirst({
      where: { email: data.email, otp: data.otp },
    });

    if (!existingOtp || existingOtp.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: existingOtp
            ? 'Verification code expired!'
            : 'Invalid verification code!',
        },
        { status: 400 }
      );
    }
    // if otp is valid, create user
    await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        password: hashedPassword,
        provider: 'credentials',
      },
    });

    // delete otp
    await prisma.otp.delete({ where: { id: existingOtp.id } });

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
  }
}
