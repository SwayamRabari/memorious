//dynamic route for noteId is defined here
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

//create a new note
export async function POST(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const noteId = params.noteId;
  if (!noteId) {
    return NextResponse.json(
      { error: 'Note id is required!' },
      { status: 400 }
    );
  }
  const { userId, title, content } = await request.json();
  const note = await prisma.note.create({
    data: {
      userId,
      title,
      content,
    },
  });
  return NextResponse.json({ note });
}

// Update an existing note
export async function PUT(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const noteId = params.noteId;
  if (!noteId) {
    return NextResponse.json(
      { error: 'Note ID is required!' },
      { status: 400 }
    );
  }
  const { title, content } = await request.json();
  try {
    const note = await prisma.note.update({
      where: { id: noteId },
      data: { title, content },
    });
    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// Delete an existing note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const noteId = params.noteId;
  if (!noteId) {
    return NextResponse.json(
      { error: 'Note ID is required!' },
      { status: 400 }
    );
  }
  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
