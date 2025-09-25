import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [hoyResult, pendientesResult, completadasResult, usuariosResult] = await Promise.all([
      // Requisiciones de hoy
      query(`
        SELECT COUNT(*) as count 
        FROM requisicion 
        WHERE DATE(fecha_solicitud) = CURDATE()
      `),
      
      // Requisiciones pendientes
      query(`
        SELECT COUNT(*) as count 
        FROM requisicion 
        WHERE estado = 'pendiente'
      `),
      
      // Requisiciones aprobadas
      query(`
        SELECT COUNT(*) as count 
        FROM requisicion 
        WHERE estado = 'aprobada'
      `),
      
      // Usuarios activos (coordinadores + personal de compras)
      query(`
        SELECT 
          (SELECT COUNT(*) FROM coordinador) as coordinadores,
          (SELECT COUNT(*) FROM compras) as compradores
      `)
    ]);

    // Procesar resultados
    const totalUsuarios = 
      (usuariosResult[0]?.coordinadores || 0) + 
      (usuariosResult[0]?.compradores || 0);

    return NextResponse.json({
      hoy: hoyResult[0]?.count || 0,
      pendientes: pendientesResult[0]?.count || 0,
      completadas: completadasResult[0]?.count || 0,
      totalUsuarios
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard de administración:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}