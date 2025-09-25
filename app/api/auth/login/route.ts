// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Definir interfaces para los tipos de usuario
interface Admin extends RowDataPacket {
  id: number;
  email: string;
  rol: 'admin';
  clave: string;
  nombre?: string;
}

interface Coordinador extends RowDataPacket {
  id: number;
  email: string;
  rol: 'coordinador';
  empresa: string;
  clave: string;
}

interface Compras extends RowDataPacket {
  id: number;
  email: string;
  rol: 'compras';
  clave: string;
}

type Usuario = Admin | Coordinador | Compras;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // 1. Verificar si es administrador
    const [admins] = await pool.query<Admin[]>(
      `SELECT administrador_id as id, correo as email, 'admin' as rol, clave 
       FROM administrador 
       WHERE correo = ?`,
      [email]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      if (admin.clave === password) {
        const { clave, ...userWithoutPassword } = admin;
        return NextResponse.json({
          user: userWithoutPassword
        });
      }
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // 2. Verificar si es coordinador
    const [coordinadores] = await pool.query<Coordinador[]>(
      `SELECT coordinador_id as id, correo as email, 'coordinador' as rol, empresa, clave 
       FROM coordinador 
       WHERE correo = ?`,
      [email]
    );

    if (coordinadores.length > 0) {
      const coordinador = coordinadores[0];
      if (!password) {
        return NextResponse.json(
          { requiresPassword: true },
          { status: 200 }
        );
      }
      if (coordinador.clave === password) {
        const { clave, ...userWithoutPassword } = coordinador;
        return NextResponse.json({
          user: userWithoutPassword
        });
      }
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // 3. Verificar si es de compras
    const [compras] = await pool.query<Compras[]>(
      `SELECT usuario_id as id, correo as email, 'compras' as rol, clave 
       FROM compras 
       WHERE correo = ?`,
      [email]
    );

    if (compras.length > 0) {
      const compra = compras[0];
      if (!password) {
        return NextResponse.json(
          { requiresPassword: true },
          { status: 200 }
        );
      }
      if (compra.clave === password) {
        const { clave, ...userWithoutPassword } = compra;
        return NextResponse.json({
          user: userWithoutPassword
        });
      }
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error en el login:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}