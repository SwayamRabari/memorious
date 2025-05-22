//gemini-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  try {
    const result = await model.generateContent(prompt);
    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
  }
}
