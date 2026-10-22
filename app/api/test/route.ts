// app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API route working!' });
}

export async function POST() {
  return NextResponse.json({ message: 'POST route working!' });
}