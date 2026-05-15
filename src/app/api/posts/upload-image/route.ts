import { NextResponse } from 'next/server';

const LARAVEL_API = 'http://localhost:3001/api';
const LARAVEL_BASE = 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${LARAVEL_API}/posts/upload-image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    // Convert relative path (/storage/...) to full URL so the browser can load it
    if (data.image_url && data.image_url.startsWith('/')) {
      data.image_url = LARAVEL_BASE + data.image_url;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
