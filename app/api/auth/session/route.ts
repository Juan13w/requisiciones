import { NextResponse } from 'next/server';

export async function GET() {
  // Este endpoint ahora es solo un marcador de posición
  // La autenticación real se maneja a través de localStorage
  return NextResponse.json({ 
    user: null 
  });
}
