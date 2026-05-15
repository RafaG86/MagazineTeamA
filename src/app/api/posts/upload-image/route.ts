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
    console.log('--- Upload Image Proxy Started ---');
    
    // 1. Parse JSON
    let body;
    try {
      body = await request.json();
      console.log('Successfully parsed JSON body, base64 length:', body.image_base64?.length);
    } catch (e: any) {
      console.error('Error parsing request.json():', e.message);
      return NextResponse.json({ error: 'Payload too large or invalid JSON: ' + e.message }, { status: 500 });
    }

    if (!body.image_base64) {
      return NextResponse.json({ error: 'Se requiere image_base64.' }, { status: 400 });
    }

    // 2. Fetch to Laravel
    console.log('Fetching to Laravel at:', `${LARAVEL_API}/posts/upload-image`);
    const res = await fetch(`${LARAVEL_API}/posts/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: body.image_base64 }),
      signal: AbortSignal.timeout(30000), // Increased timeout for large base64 uploads
    });
    
    console.log('Laravel response status:', res.status);

    let data;
    try {
      data = await res.json();
    } catch (e: any) {
      console.error('Error parsing Laravel response:', e.message);
      return NextResponse.json({ error: 'Laravel returned invalid JSON' }, { status: 500 });
    }

    if (!res.ok) {
      console.error('Laravel returned error:', data);
      return NextResponse.json(data, { status: res.status });
    }

    // Convert relative path (/storage/...) to absolute URL using internal Laravel address
    if (data.image_url && data.image_url.startsWith('/')) {
      data.image_url = 'http://localhost:3001' + data.image_url;
    }

    console.log('Upload proxy success, returning URL:', data.image_url);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fatal error in upload proxy:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
