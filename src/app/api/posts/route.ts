import { NextResponse } from 'next/server';

const LARAVEL_API = 'http://127.0.0.1:3001/api';

export async function GET() {
  try {
    const res = await fetch(`${LARAVEL_API}/posts`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('NEXTJS PROXY /api/posts RECEIVED:', JSON.stringify(body));
    const res = await fetch(`${LARAVEL_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
