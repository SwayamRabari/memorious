import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const data = await request.json();
  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      userId: data.userId,
    },
  });
  return NextResponse.json({ note });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();
  const note = await prisma.note.update({
    where: { id: data.id },
    data: {
      title: data.title,
      content: data.content,
    },
  });
  return NextResponse.json({ note });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();
  await prisma.note.delete({
    where: { id: data.id },
  });
  return NextResponse.json({ success: true });
}
