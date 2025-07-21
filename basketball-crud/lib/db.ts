import sql from 'mssql'

const config: sql.config = {
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    server: process.env.DB_SERVER!,
    database: process.env.DB_DATABASE!,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
}

let pool: sql.ConnectionPool | null = null

export async function getConnection() {
    if (!pool) {
        pool = new sql.ConnectionPool(config)
        await pool.connect()
    }

    console.log('Connected to data base')
    return pool
}

export { sql }
