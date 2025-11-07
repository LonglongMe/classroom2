import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT /api/stats/passages  更新学生-篇目统计
// body: { studentId, passageId, selectedCount, passCount }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, passageId, selectedCount, passCount } = body || {}
    if (!studentId || !passageId) {
      return NextResponse.json({ error: "studentId 与 passageId 必填" }, { status: 400 })
    }
    // UPSERT
    await query(
      `INSERT INTO passage_stats (student_id, passage_id, selected_count, pass_count)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_count = VALUES(selected_count), pass_count = VALUES(pass_count)`,
      [studentId, passageId, selectedCount ?? 0, passCount ?? 0]
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("PUT /api/stats/passages error:", error)
    return NextResponse.json({ error: error.message || "更新统计失败" }, { status: 500 })
  }
}


