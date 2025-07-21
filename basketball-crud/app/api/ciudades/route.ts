import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Ciudad } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    const pool = await getConnection()

    let query = "SELECT * FROM Ciudad"
    let countQuery = "SELECT COUNT(*) as total FROM Ciudad"

    if (search) {
      query += ` WHERE Nombre LIKE '%${search}%'`
      countQuery += ` WHERE Nombre LIKE '%${search}%'`
    }

    query += ` ORDER BY Nombre OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

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
    console.error("Error fetching ciudades:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Ciudad = await request.json()
    const pool = await getConnection()

    const result = await pool
      .request()
      .input("CodCiudad", sql.NChar(3), body.CodCiudad)
      .input("Nombre", sql.VarChar(25), body.Nombre)
      .query("INSERT INTO Ciudad (CodCiudad, Nombre) VALUES (@CodCiudad, @Nombre)")

    return NextResponse.json({ message: "Ciudad creada exitosamente" })
  } catch (error) {
    console.error("Error creating ciudad:", error)
    return NextResponse.json({ error: "Error al crear la ciudad" }, { status: 500 })
  }
}
