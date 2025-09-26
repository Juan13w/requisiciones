import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PoolConnection } from 'mysql2/promise';

// Interfaz para el resultado de la actualización de la base de datos
interface UpdateResult {
  affectedRows: number;
}

/**
 * Maneja las solicitudes PUT para actualizar una requisición existente.
 * Acepta 'estado', 'comentarioRechazo', 'fechaUltimoRechazo', 'intentosRevision'.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const requisicionId = parseInt(params.id, 10);
  if (isNaN(requisicionId) || requisicionId <= 0) {
    return NextResponse.json({ success: false, error: 'ID de requisición no válido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { 
      estado, 
      comentarioRechazo, 
      fechaUltimoRechazo, 
      intentosRevision,
      descripcion,
      cantidad,
      justificacion,
      proceso,
      imagenes
    } = body;

    if (!estado) {
      return NextResponse.json({ success: false, error: 'El campo estado es requerido' }, { status: 400 });
    }

    const validStates = ['pendiente', 'aprobada', 'rechazada', 'correccion', 'cerrada'];
    if (!validStates.includes(estado)) {
      return NextResponse.json({ success: false, error: `Estado no válido: ${estado}` }, { status: 400 });
    }

    // Construcción dinámica de la consulta SQL para evitar inyecciones y manejar campos opcionales
    const fieldsToUpdate: string[] = [];
    const values: (string | number | null)[] = [];

    fieldsToUpdate.push('estado = ?');
    values.push(estado);

    // Mapear nombres del body (camelCase) a columnas reales (snake_case)
    if (comentarioRechazo !== undefined) {
      fieldsToUpdate.push('comentario_rechazo = ?');
      values.push(comentarioRechazo);
    }
    if (fechaUltimoRechazo !== undefined) {
      fieldsToUpdate.push('fecha_ultimo_rechazo = ?');
      values.push(fechaUltimoRechazo);
    }
    if (intentosRevision !== undefined) {
      fieldsToUpdate.push('intentos_revision = ?');
      values.push(intentosRevision);
    }

    // Campos editables al reenviar en corrección
    if (descripcion !== undefined) {
      fieldsToUpdate.push('descripcion = ?');
      values.push(descripcion);
    }
    if (cantidad !== undefined) {
      fieldsToUpdate.push('cantidad = ?');
      values.push(cantidad);
    }
    if (justificacion !== undefined) {
      fieldsToUpdate.push('justificacion = ?');
      values.push(justificacion);
    }
    if (proceso !== undefined) {
      fieldsToUpdate.push('proceso = ?');
      values.push(proceso);
    }
    if (Array.isArray(imagenes) && imagenes.length > 0) {
      fieldsToUpdate.push('img = ?');
      values.push(imagenes[0]);
    }

    // Siempre actualizamos la fecha de modificación para llevar un registro
    fieldsToUpdate.push('fecha_ultimo_modificacion = NOW()');

    // El ID de la requisición va al final para el WHERE
    values.push(requisicionId);

    const sql = `UPDATE requisicion SET ${fieldsToUpdate.join(', ')} WHERE requisicion_id = ?`;

    const result = await query<UpdateResult>(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'La requisición no fue encontrada o no se realizaron cambios' }, { status: 404 });
    }

    // Registrar historial del cambio
    try {
      const comentarioParaHistorial = comentarioRechazo !== undefined ? comentarioRechazo : null;
      await query(
        'INSERT INTO requisicion_historial (requisicion_id, estado, comentario) VALUES (?, ?, ?)',
        [requisicionId, estado, comentarioParaHistorial]
      );
    } catch (histErr) {
      console.warn('No se pudo registrar historial de requisición:', histErr);
      // No interrumpimos el flujo por error de historial
    }

    // Después de actualizar, obtenemos el registro completo para devolverlo
    const [updatedRows] = await query<any[]>('SELECT * FROM requisicion WHERE requisicion_id = ?', [requisicionId]);

    if (updatedRows.length === 0) {
      return NextResponse.json({ success: false, error: 'No se pudo recuperar la requisición actualizada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Requisición actualizada correctamente', data: updatedRows[0] });

  } catch (error) {
    console.error('Error en PUT /api/requisiciones/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor';
    // Diferenciar entre error de parseo de JSON y otros errores
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Cuerpo de la solicitud inválido (no es JSON válido)' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
  }
}

/**
 * Maneja las solicitudes GET para obtener los detalles de una única requisición.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const requisicionId = parseInt(params.id, 10);
  if (isNaN(requisicionId) || requisicionId <= 0) {
    return NextResponse.json({ success: false, error: 'ID de requisición no válido' }, { status: 400 });
  }

  try {
    const [rows] = await query<any[]>(`
      SELECT 
        r.*,
        COALESCE(r.comentario_rechazo, '') as comentarioRechazo,
        DATE_FORMAT(r.fecha_ultimo_rechazo, '%Y-%m-%d %H:%i:%s') as fechaUltimoRechazo
      FROM requisicion r
      WHERE r.requisicion_id = ?
    `, [requisicionId]);
    
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Requisición no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...rows[0],
        // Aseguramos que estos campos siempre estén definidos
        comentarioRechazo: rows[0].comentarioRechazo || '',
        fechaUltimoRechazo: rows[0].fechaUltimoRechazo || null
      }
    });
  } catch (error) {
    console.error('Error en GET /api/requisiciones/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor', 
      details: errorMessage 
    }, { status: 500 });
  }
}

/**
 * Maneja las solicitudes DELETE para eliminar una requisición.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('Solicitud DELETE recibida para la requisición ID:', params.id);
  const requisicionId = parseInt(params.id, 10);
  
  if (isNaN(requisicionId) || requisicionId <= 0) {
    console.error('ID de requisición no válido:', params.id);
    return NextResponse.json({ success: false, error: 'ID de requisición no válido' }, { status: 400 });
  }

  try {
    console.log('Verificando si la requisición existe...');
    // Verificar primero si la requisición existe
    const [existing] = await query<any[]>('SELECT 1 FROM requisicion WHERE requisicion_id = ?', [requisicionId]);
    
    if (existing.length === 0) {
      console.error('Requisición no encontrada con ID:', requisicionId);
      return NextResponse.json({ success: false, error: 'Requisición no encontrada' }, { status: 404 });
    }

    console.log('Eliminando historial de estados relacionado...');
    try {
      // Primero, eliminar el historial relacionado si existe
      await query('DELETE FROM historial_estados WHERE requisicion_id = ?', [requisicionId]);
      console.log('Historial de estados eliminado correctamente');
    } catch (historyError) {
      console.warn('No se pudo eliminar el historial de estados (puede que no exista):', historyError);
      // Continuamos aunque falle, ya que el historial podría no existir
    }
    
    console.log('Eliminando la requisición...');
    // Luego, eliminar la requisición
    const result = await query('DELETE FROM requisicion WHERE requisicion_id = ?', [requisicionId]) as unknown as { affectedRows: number };
    
    console.log('Resultado de la eliminación:', result);
    
    if (result.affectedRows === 0) {
      console.error('No se afectaron filas al intentar eliminar la requisición');
      return NextResponse.json({ success: false, error: 'No se pudo eliminar la requisición' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Requisición eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar la requisición:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar la requisición';
    return NextResponse.json({ 
      success: false, 
      error: 'Error al eliminar la requisición',
      details: errorMessage 
    }, { status: 500 });
  }
}

  