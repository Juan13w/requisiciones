import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { enviarNotificacionRequisicion } from '@/services/emailService';

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
    
    // Obtener los datos del usuario desde el formulario
    let usuarioData = null;
    let coordinadorId = null;
    let nombreSolicitante = '';

    if (formData.usuarioData) {
      // Si usuarioData es un string, lo parseamos, si ya es un objeto, lo usamos directamente
      usuarioData = typeof formData.usuarioData === 'string' 
        ? JSON.parse(formData.usuarioData) 
        : formData.usuarioData;
      
      coordinadorId = usuarioData.coordinador_id || usuarioData.id;
      nombreSolicitante = usuarioData.email || '';
    }
    
    if (!coordinadorId) {
      return NextResponse.json(
        { error: 'No se pudo identificar al coordinador' },
        { status: 400 }
      );
    }
    
    console.log('Creando requisición para el coordinador ID:', coordinadorId, 'Nombre:', nombreSolicitante);

    // Insertar en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO requisicion 
       (consecutivo, empresa, fecha_solicitud, nombre_solicitante, proceso, justificacion, descripcion, cantidad, img, coordinador_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        consecutivo,
        formData.empresa || '',
        formData.fechaSolicitud || new Date().toISOString().split('T')[0],
        formData.nombreSolicitante || '',
        formData.proceso || '',
        formData.justificacion || '',
        formData.descripcion || '',
        Number(formData.cantidad) || 1,
        imagenBuffer,
        coordinadorId
      ]
    ) as any; // Usamos 'as any' temporalmente para evitar el error de tipo

    // Obtener el ID insertado de forma confiable
    let insertId: number | null = (result && (result as any).insertId) ? (result as any).insertId : null;
    if (!insertId) {
      // Fallback a LAST_INSERT_ID() solo si es necesario
      const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id');
      insertId = Array.isArray(rows) && rows[0] ? (rows[0] as any).id : null;
    }

    // Registrar historial de creación
    try {
      const estadoInicial = formData.estado || 'pendiente';
      const comentarioInicial = 'Requisición creada';
      await pool.execute(
        'INSERT INTO requisicion_historial (requisicion_id, estado, comentario, usuario) VALUES (?, ?, ?, ?)',
        [insertId, estadoInicial, comentarioInicial, nombreSolicitante || null]
      );
    } catch (histErr) {
      console.warn('No se pudo registrar historial de creación:', histErr);
    }

    // Enviar notificación por correo electrónico
    if (process.env.NOTIFICATION_EMAIL) {
      try {
        // Obtener más detalles de la requisición para el correo
        const [requisicion] = await pool.query(
          'SELECT * FROM requisicion WHERE requisicion_id = ?',
          [insertId]
        ) as any[];

        if (requisicion && requisicion.length > 0) {
          const reqData = requisicion[0];
          
          // Enviar notificación por correo electrónico
          await enviarNotificacionRequisicion(process.env.NOTIFICATION_EMAIL, {
            id: reqData.id,
            titulo: `Requisición ${reqData.consecutivo}`,
            descripcion: reqData.descripcion || 'Sin descripción adicional',
            fecha_creacion: reqData.fecha_solicitud,
            creado_por: reqData.nombre_solicitante || 'Usuario desconocido'
          });
        }
      } catch (emailError) {
        console.error('Error al enviar notificación por correo:', emailError);
        // No fallamos la petición si hay un error al enviar el correo
      }
    }

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coordinadorId = searchParams.get('coordinadorId');

    let query = `
      SELECT r.*, c.correo as coordinador_email, c.empresa as coordinador_empresa 
      FROM requisicion r
      LEFT JOIN coordinador c ON r.coordinador_id = c.coordinador_id
    `;
    const params = [];

    if (coordinadorId) {
      query += ' WHERE r.coordinador_id = ?';
      params.push(coordinadorId);
    }

    query += ' ORDER BY requisicion_id DESC';

    const [rows] = await pool.query(query, params);
    
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

      // Usar la fecha exacta de la base de datos
      const fechaSolicitud = row.fecha_solicitud 
        ? new Date(row.fecha_solicitud).toISOString()
        : new Date().toISOString();
      
      return {
        id: row.requisicion_id.toString(),
        requisicion_id: row.requisicion_id,
        consecutivo: row.consecutivo?.toString() || '',
        empresa: row.empresa || '',
        fechaSolicitud: fechaSolicitud,
        nombreSolicitante: row.nombre_solicitante || '',
        proceso: row.proceso || '',
        justificacion: row.justificacion || '',
        descripcion: row.descripcion || '',
        cantidad: Number(row.cantidad) || 1,
        imagenes: imagenes,
        estado: row.estado || 'pendiente', // Asegurar que siempre haya un estado
        fechaCreacion: row.fecha_creacion 
          ? new Date(row.fecha_creacion).getTime() 
          : (row.fecha_solicitud 
              ? new Date(row.fecha_solicitud).getTime() 
              : Date.now())
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
