import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.firstName || !data.lastName || !data.email || !data.password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // 6 digit otp in string format
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // expires in 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const existingOtp = await prisma.otp.findFirst({
      where: { email: data.email },
    });

    // if existing otp, delete it and create a new one
    if (existingOtp) {
      await prisma.otp.delete({ where: { id: existingOtp.id } });
    }

    await prisma.otp.create({
      data: {
        email: data.email,
        otp,
        expiresAt: expires,
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as nodemailer.TransportOptions);

    const mailOptions = {
      from: '"Memorious" <memorious.so@gmail.com>',
      to: data.email,
      subject: 'Verify your email address',
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
