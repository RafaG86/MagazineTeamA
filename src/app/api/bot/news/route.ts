import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  let browser;
  try {
    const API_KEY = process.env.SPORTS_AI_KEY;
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=noticias+deportes+colombia+hoy&hl=es', { waitUntil: 'domcontentloaded' });
    const rawText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
    await browser.close();

    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Redacta noticia JSON de: ${rawText}` }] }]
      })
    });

    const result = await googleResponse.json();
    const aiText = result.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    let news = [];
    if (jsonMatch) news = [JSON.parse(jsonMatch[0])];

    return NextResponse.json({ news, debug_raw: "DIRECT FETCH OK | " + rawText.substring(0, 500) });
  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ news: [], debug_raw: "FALLO DIRECTO: " + error.message }, { status: 200 });
  }
}
