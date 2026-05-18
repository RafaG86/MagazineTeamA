import { NextResponse } from 'next/server';

const LARAVEL_API = 'http://127.0.0.1:3001/api';

export async function GET() {
  try {
    const res = await fetch(`${LARAVEL_API}/teams`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
