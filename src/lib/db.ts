import mysql from "mysql2/promise"
import { dbConfig } from "@/config/db"

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query(sql: string, params?: any[]) {
  const connection = await getPool().getConnection()
  try {
    // 确保 params 不是 undefined，并且过滤掉任何 undefined 值
    const safeParams = params 
      ? params.map(p => (p === undefined ? null : p))
      : []
    
    const [results] = await connection.execute(sql, safeParams)
    return results
  } finally {
    connection.release()
  }
}

