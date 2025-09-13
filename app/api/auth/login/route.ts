import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

interface Usuario {
  id: number;
  correo: string;
  rol: 'coordinador' | 'compras';
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 })
    }

    // Buscar primero en coordinadores
    const coordinadores = await sql`
      SELECT coordinador_id as id, correo, 'coordinador' as rol 
      FROM coordinador 
      WHERE correo = ${email}
    ` as unknown as Usuario[];

    // Si no es coordinador, buscar en compras
    let usuario: Usuario | null = null;
    if (coordinadores.length > 0) {
      usuario = coordinadores[0];
    } else {
      const compras = await sql`
        SELECT usuario_id as id, correo, 'compras' as rol 
        FROM compras 
        WHERE correo = ${email}
      ` as unknown as Usuario[];
      
      if (compras.length > 0) {
        usuario = compras[0];
      }
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado o no autorizado" }, { status: 401 })
    }

    // Login exitoso
    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        email: usuario.correo,
        rol: usuario.rol,
        isAdmin: usuario.rol === 'compras' // Por si necesitas mantener compatibilidad con isAdmin
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
