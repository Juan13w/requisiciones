import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Empresa extends RowDataPacket {
  nombre: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    const [rows] = await pool.query<Empresa[]>(
      `SELECT DISTINCT empresa as nombre 
       FROM coordinador 
       WHERE empresa LIKE ? 
         AND empresa IS NOT NULL 
         AND empresa != ''
       ORDER BY empresa 
       LIMIT 10`,
      [`%${query}%`]
    ) as [Empresa[], any];

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al buscar empresas:', error);
    return NextResponse.json(
      { error: 'Error al buscar empresas' },
      { status: 500 }
    );
  }
}
