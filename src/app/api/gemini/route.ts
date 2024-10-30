//gemini-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent(prompt);
    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
  }
}
