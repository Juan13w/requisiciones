import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

interface Coordinador {
  coordinador_id: number;
  correo: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 })
    }

    // Buscar el coordinador por correo
    const result = await sql`
      SELECT * FROM coordinador WHERE correo = ${email}
    `
    
    // Convertir el resultado a un array de Coordinador
    const coordinadores = result as unknown as Coordinador[];

    if (!coordinadores || coordinadores.length === 0) {
      return NextResponse.json({ error: "Coordinador no encontrado" }, { status: 401 })
    }

    const coordinador = coordinadores[0];

    // Login exitoso
    return NextResponse.json({
      success: true,
      user: {
        id: coordinador.coordinador_id,
        email: coordinador.correo,
        isAdmin: false,
      }
    })

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
