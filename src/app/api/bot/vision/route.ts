import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.SPORTS_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // Imagen en Base64
    if (!image) throw new Error('No se recibió ninguna imagen.');

    // Limpiar el prefijo base64 si existe
    const base64Data = image.split(',')[1] || image;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analiza esta imagen de una tabla de posiciones de fútbol y extrae los datos. Devuelve un JSON estrictamente así: { \"standings\": [ {\"pos\": 1, \"team\": \"...\", \"pj\": 0, \"gd\": 0, \"pts\": 0}, ... ] }";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error('La IA no pudo leer la tabla de la imagen.');
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    console.error('Error en Visión IA:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
