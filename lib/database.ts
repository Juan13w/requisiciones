import mysql from 'mysql2/promise'

// Validar variables de entorno necesarias
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`)
  }
}

// Crear pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME!,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Función helper para ejecutar queries
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  let query = strings[0]
  for (let i = 0; i < values.length; i++) {
    query += '?' + strings[i + 1]
  }
  const [rows] = await pool.execute(query, values)
  return rows
}

export { pool }

// Tipos TypeScript para la base de datos requisiciones_db
export interface Coordinador {
  coordinador_id: number
  correo: string
}

export interface Requisicion {
  requisicion_id: number
  consecutivo: number
  empresa: string
  fecha_solicitud: Date
  nombre_solicitante: string
  proceso: string
  justificacion: string
  descripcion: string
  cantidad: number
}