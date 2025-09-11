import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

interface TestResult {
  test: number;
}

export async function GET() {
  try {
    // Probar conexión con una consulta simple
    const result = (await sql`SELECT 1 as test`) as unknown as TestResult[]
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión a la base de datos exitosa',
      data: result
    })
  } catch (error: unknown) {
    console.error('Error en la conexión a la base de datos:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al conectar con la base de datos';
      
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al conectar con la base de datos',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
