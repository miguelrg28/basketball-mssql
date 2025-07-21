import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Estadistica } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    const pool = await getConnection()

    let query = "SELECT * FROM Estadistica"
    let countQuery = "SELECT COUNT(*) as total FROM Estadistica"

    if (search) {
      const searchCondition = ` WHERE Descripcion LIKE '%${search}%' OR CodEstadistica LIKE '%${search}%'`
      query += searchCondition
      countQuery += searchCondition
    }

    query += ` ORDER BY Descripcion OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

    const [result, countResult] = await Promise.all([pool.request().query(query), pool.request().query(countQuery)])

    const total = countResult.recordset[0].total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: result.recordset,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("Error fetching estadisticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Estadistica = await request.json()
    const pool = await getConnection()

    const result = await pool
      .request()
      .input("CodEstadistica", sql.NChar(5), body.CodEstadistica)
      .input("Descripcion", sql.VarChar(25), body.Descripcion)
      .input("Valor", sql.TinyInt, body.Valor)
      .query(`
        INSERT INTO Estadistica (CodEstadistica, Descripcion, Valor) 
        VALUES (@CodEstadistica, @Descripcion, @Valor)
      `)

    return NextResponse.json({ message: "Estadística creada exitosamente" })
  } catch (error) {
    console.error("Error creating estadistica:", error)
    return NextResponse.json({ error: "Error al crear la estadística" }, { status: 500 })
  }
}
