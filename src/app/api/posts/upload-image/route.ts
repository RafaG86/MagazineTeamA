import { NextResponse } from 'next/server';

const LARAVEL_API = 'http://localhost:3001/api';

/**
 * Receives: JSON { image_base64: "data:image/jpeg;base64,..." }
 * Forwards:  JSON to Laravel, which decodes + saves
 * Returns:   JSON { image_url: "http://localhost:3001/storage/posts/xxx.jpg" }
 *
 * Using base64 JSON instead of multipart avoids:
 *  - Next.js 15 stream truncation bug (FormData proxy loses bytes)
 *  - Browser Mixed Content block (HTTPS page → HTTP direct upload)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.image_base64) {
      return NextResponse.json({ error: 'Se requiere image_base64.' }, { status: 400 });
    }

    const res = await fetch(`${LARAVEL_API}/posts/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: body.image_base64 }),
      signal: AbortSignal.timeout(20000),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Convert relative path (/storage/...) to absolute URL using internal Laravel address
    if (data.image_url && data.image_url.startsWith('/')) {
      data.image_url = 'http://localhost:3001' + data.image_url;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
