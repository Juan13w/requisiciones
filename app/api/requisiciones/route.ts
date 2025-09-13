import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    // Validar datos requeridos
    if (!formData.consecutivo || !formData.empresa || !formData.nombreSolicitante || 
        !formData.proceso || !formData.justificacion || !formData.descripcion || 
        typeof formData.cantidad === 'undefined') {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir la imagen de base64 a Buffer si existe
    const imagenBuffer = formData.imagenes && formData.imagenes.length > 0 
      ? Buffer.from(formData.imagenes[0].split(',')[1], 'base64')
      : null;

    // Asegurarse de que el consecutivo sea una cadena
    const consecutivo = formData.consecutivo?.toString() || '';
    
    // Insertar en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO requisicion 
       (consecutivo, empresa, fecha_solicitud, nombre_solicitante, proceso, justificacion, descripcion, cantidad, img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        consecutivo,
        formData.empresa || '',
        formData.fechaSolicitud || new Date().toISOString().split('T')[0],
        formData.nombreSolicitante || '',
        formData.proceso || '',
        formData.justificacion || '',
        formData.descripcion || '',
        Number(formData.cantidad) || 1,
        imagenBuffer
      ]
    ) as any; // Usamos 'as any' temporalmente para evitar el error de tipo

    // Obtener el ID insertado
    const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id');
    const insertId = Array.isArray(rows) && rows[0] ? (rows[0] as any).id : null;

    return NextResponse.json({ 
      success: true, 
      id: insertId 
    });

  } catch (error) {
    console.error('Error al guardar la requisición:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar la requisición' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM requisicion ORDER BY requisicion_id DESC');
    
    // Mapear los resultados de la base de datos al formato esperado
    const requisitions = (rows as any[]).map(row => {
      // Convertir el buffer de la imagen a una URL de datos si existe
      let imagenes: string[] = [];
      if (row.img && row.img.length > 0) {
        // Determinar el tipo de imagen (asumimos jpg por defecto)
        const mimeType = 'image/jpeg'; // o podrías detectar el tipo real si lo tienes almacenado
        const base64Image = row.img.toString('base64');
        imagenes = [`data:${mimeType};base64,${base64Image}`];
      }

      return {
        id: row.requisicion_id.toString(),
        consecutivo: row.consecutivo?.toString() || '',
        empresa: row.empresa || '',
        fechaSolicitud: row.fecha_solicitud || new Date().toISOString().split('T')[0],
        nombreSolicitante: row.nombre_solicitante || '',
        proceso: row.proceso || '',
        justificacion: row.justificacion || '',
        descripcion: row.descripcion || '',
        cantidad: Number(row.cantidad) || 1,
        imagenes: imagenes,
        fechaCreacion: row.fecha_solicitud 
          ? new Date(row.fecha_solicitud).getTime() 
          : Date.now()
      };
    });
    
    return NextResponse.json(requisitions);
  } catch (error) {
    console.error('Error al obtener las requisiciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las requisiciones' },
      { status: 500 }
    );
  }
}
