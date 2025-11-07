import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = params instanceof Promise ? await params : params
    const id = resolved.id
    const rows = await query(`SELECT id, title, author, content, created_at FROM passages WHERE id = ?`, [id]) as any[]
    if (rows.length === 0) return NextResponse.json({ error: "篇目不存在" }, { status: 404 })
    const r = rows[0]
    return NextResponse.json({
      id: String(r.id),
      title: r.title,
      author: r.author ?? "",
      content: r.content ?? "",
      createdAt: r.created_at,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = params instanceof Promise ? await params : params
    const id = resolved.id
    const body = await request.json()
    const { title, author, content } = body || {}
    if (!title) return NextResponse.json({ error: "title 必填" }, { status: 400 })
    await query(`UPDATE passages SET title = ?, author = ?, content = ? WHERE id = ?`, [title, author ?? "", content ?? "", id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = params instanceof Promise ? await params : params
    const id = resolved.id
    await query(`DELETE FROM passages WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


