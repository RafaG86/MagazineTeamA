import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  let browser;
  try {
    const API_KEY = process.env.SPORTS_AI_KEY;
    if (!API_KEY) throw new Error('No se encontró la clave SPORTS_AI_KEY en el servidor.');

    console.log('IA Team A: Conexión Directa por Túnel (Sin SDK)...');
    
    browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=tabla+posiciones+liga+betplay+dimayor+puntos+2025&hl=es', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await new Promise(r => setTimeout(r, 4000));
    const rawText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
    await browser.close();

    // PETICIÓN DIRECTA A GOOGLE (Réplica exacta del curl que funcionó)
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza este texto y extrae la tabla de posiciones JSON: { "standings": [...] } de la Liga BetPlay: \n${rawText}`
          }]
        }]
      })
    });

    const result = await googleResponse.json();
    
    if (result.error) {
        throw new Error(`Google API Error: ${result.error.message}`);
    }

    const aiText = result.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    let standings = [];
    if (jsonMatch) standings = JSON.parse(jsonMatch[0]).standings;

    return NextResponse.json({ 
      standings, 
      debug_raw: "CONEXIÓN DIRECTA (FETCH) EXITOSA | " + rawText.substring(0, 500) 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ 
      standings: [], 
      debug_raw: "FALLO CONEXIÓN DIRECTA: " + error.message 
    }, { status: 200 });
  }
}
