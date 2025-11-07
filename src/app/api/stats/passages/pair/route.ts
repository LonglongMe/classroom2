import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/stats/passages/pair?studentId=...&passageId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const passageId = searchParams.get("passageId")
    if (!studentId || !passageId) {
      return NextResponse.json({ error: "studentId 与 passageId 必填" }, { status: 400 })
    }
    const rows = await query(
      `SELECT selected_count, pass_count FROM passage_stats WHERE student_id = ? AND passage_id = ? LIMIT 1`,
      [studentId, passageId]
    ) as any[]
    if (rows.length === 0) return NextResponse.json({ selectedCount: 0, passCount: 0 })
    const r = rows[0]
    return NextResponse.json({ selectedCount: Number(r.selected_count) || 0, passCount: Number(r.pass_count) || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "获取失败" }, { status: 500 })
  }
}


