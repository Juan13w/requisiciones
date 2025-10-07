import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { enviarNotificacionRequisicion } from '@/services/emailService';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Validar datos requeridos
    if (
      !formData.consecutivo || !formData.empresa || !formData.nombreSolicitante ||
      !formData.proceso || !formData.justificacion || !formData.descripcion ||
      typeof formData.cantidad === 'undefined'
    ) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir el PDF de base64 a Buffer si existe
    const pdfBuffer = formData.imagenes && formData.imagenes.length > 0
      ? Buffer.from(formData.imagenes[0].split(',')[1], 'base64')
      : null;

    // Asegurar que el consecutivo sea texto
    const consecutivo = formData.consecutivo?.toString() || '';

    // Datos del usuario que crea la requisición
    let usuarioData = null;
    let coordinadorId = null;
    let nombreSolicitante = '';

    if (formData.usuarioData) {
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

    console.log('📦 Creando requisición para coordinador ID:', coordinadorId);

    // Insertar en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO requisicion 
       (consecutivo, empresa, fecha_solicitud, nombre_solicitante, proceso, justificacion, descripcion, cantidad, pdf, coordinador_id)
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
        pdfBuffer,
        coordinadorId
      ]
    ) as any;

    // Obtener ID insertado
    let insertId: number | null = result?.insertId || null;
    if (!insertId) {
      const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id');
      insertId = Array.isArray(rows) && rows[0] ? (rows[0] as any).id : null;
    }

    // Registrar historial
    try {
      const estadoInicial = formData.estado || 'pendiente';
      const comentarioInicial = 'Requisición creada';
      await pool.execute(
        'INSERT INTO requisicion_historial (requisicion_id, estado, comentario, usuario) VALUES (?, ?, ?, ?)',
        [insertId, estadoInicial, comentarioInicial, nombreSolicitante || null]
      );
    } catch (histErr) {
      console.warn('⚠️ No se pudo registrar historial:', histErr);
    }

    // Enviar notificación (opcional)
    if (process.env.NOTIFICATION_EMAIL) {
      try {
        const [requisicion] = await pool.query(
          'SELECT * FROM requisicion WHERE requisicion_id = ?',
          [insertId]
        ) as any[];

        if (requisicion && requisicion.length > 0) {
          const reqData = requisicion[0];

          await enviarNotificacionRequisicion(process.env.NOTIFICATION_EMAIL, {
            titulo: `Requisición ${reqData.consecutivo}`,
            descripcion: reqData.descripcion || 'Sin descripción adicional',
            fecha_creacion: reqData.fecha_solicitud,
            creado_por: reqData.nombre_solicitante || 'Usuario desconocido'
          });
        }
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
      }
    }

    return NextResponse.json({ success: true, id: insertId });
  } catch (error) {
    console.error('❌ Error al guardar requisición:', error);
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
      SELECT r.*, c.correo as coordinador_email, c.empresa as coordinador_empresa,
             r.comentario_rechazo as comentarioRechazo
      FROM requisicion r
      LEFT JOIN coordinador c ON r.coordinador_id = c.coordinador_id
    `;
    const params: any[] = [];

    if (coordinadorId) {
      query += ' WHERE r.coordinador_id = ?';
      params.push(coordinadorId);
    }

    query += ' ORDER BY requisicion_id DESC';

    const [rows] = await pool.query(query, params);

    const requisitions = (rows as any[]).map(row => {
      let imagenes: string[] = [];

      // Si existe un archivo PDF en el campo pdf
      if (row.pdf && row.pdf.length > 0) {
        const isPDF =
          row.pdf[0] === 0x25 && row.pdf[1] === 0x50 && row.pdf[2] === 0x44 && row.pdf[3] === 0x46; // %PDF
        const mimeType = isPDF ? 'application/pdf' : 'image/jpeg';
        const base64File = row.pdf.toString('base64');
        imagenes = [`data:${mimeType};base64,${base64File}`];
      }

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
        estado: row.estado || 'pendiente',
        comentarioRechazo: row.comentarioRechazo || row.comentario_rechazo || '',
        fechaCreacion: row.fecha_creacion
          ? new Date(row.fecha_creacion).getTime()
          : (row.fecha_solicitud
            ? new Date(row.fecha_solicitud).getTime()
            : Date.now())
      };
    });

    return NextResponse.json(requisitions);
  } catch (error) {
    console.error('❌ Error al obtener requisiciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las requisiciones' },
      { status: 500 }
    );
  }
}
