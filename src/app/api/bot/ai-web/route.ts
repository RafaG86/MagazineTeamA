import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  let browser;
  try {
    console.log('Bot iniciando navegación hacia la IA de Google Search...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=es-ES']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navegar a Google
    await page.goto('https://www.google.com.co', { waitUntil: 'networkidle2' });

    // Escribir la consulta para que Google genere el resumen de IA
    const query = "tabla de posiciones liga betplay hoy resumen detallado";
    await page.type('textarea[name="q"]', query);
    await page.keyboard.press('Enter');

    // Esperar a que Google cargue los resultados e intente generar el resumen de IA (SGE)
    // Los selectores de la IA de Google cambian, intentamos capturar el área de "AI Overview"
    console.log('Esperando respuesta de la IA de Google...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Intentamos capturar el contenido del resumen de IA o la tabla destacada
    const result = await page.evaluate(() => {
      // Intentar encontrar el contenedor de la IA de Google
      const aiOverview = document.querySelector('div[role="complementary"]');
      const featuredSnippet = document.querySelector('.L9XNBe, .v7W49e');
      
      if (aiOverview) return aiOverview.textContent;
      if (featuredSnippet) return featuredSnippet.textContent;
      
      return "No se pudo capturar el resumen de IA directamente, intentando extraer tabla estándar...";
    });

    console.log('Bot capturó información de la interfaz de Google.');

    await browser.close();
    
    // Aquí procesaríamos el texto crudo para convertirlo en nuestro formato
    // Por ahora, devolvemos lo que encontró el bot
    return NextResponse.json({ 
      raw_info: result,
      message: "Información obtenida directamente de la interfaz de Google" 
    });
  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
