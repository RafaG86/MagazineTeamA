import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const db = await openDb();

    // Buscar usuario en la base de datos
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (user) {
      return NextResponse.json({ 
        message: 'Acceso concedido',
        role: user.role,
        username: user.username
      });
    } else {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Error en el servidor de autenticación' }, { status: 500 });
  }
}
