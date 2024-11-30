import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  if (!userId) {
    return NextResponse.json(
      { error: 'User id is required!' },
      { status: 400 }
    );
  }
  const notes = await prisma.note.findMany({
    where: { userId: userId },
  });
  return NextResponse.json({ notes });
}
