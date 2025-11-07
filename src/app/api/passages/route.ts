import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/passages - 获取全部篇目列表（与班级无关）
export async function GET(request: NextRequest) {
  try {
    const rows = await query(
      `SELECT id, title, author, content, created_at FROM passages ORDER BY created_at DESC`
    ) as any[]
    return NextResponse.json(rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      author: r.author ?? "",
      content: r.content ?? "",
      createdAt: r.created_at,
    })))
  } catch (error: any) {
    console.error("GET /api/passages error:", error)
    return NextResponse.json({ error: error.message || "获取篇目失败" }, { status: 500 })
  }
}

// POST /api/passages - 创建篇目 { title, author?, content? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, author = "", content = "" } = body || {}
    if (!title) {
      return NextResponse.json({ error: "title 必填" }, { status: 400 })
    }
    const id = Date.now().toString()
    await query(
      `INSERT INTO passages (id, title, author, content) VALUES (?, ?, ?, ?)`,
      [id, title, author, content]
    )
    return NextResponse.json({ id, title, author, content })
  } catch (error: any) {
    console.error("POST /api/passages error:", error)
    return NextResponse.json({ error: error.message || "创建篇目失败" }, { status: 500 })
  }
}


