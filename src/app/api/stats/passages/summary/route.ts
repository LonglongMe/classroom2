import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/stats/passages/summary?classId=xxx
// 返回篇目统计：
// - 无 classId：全局汇总（与班级无关）
// - 有 classId：仅统计该班级学生的 passage_stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    let rows: any[]
    if (classId) {
      rows = await query(
        `SELECT p.id as passage_id,
                p.title,
                p.author,
                COALESCE(SUM(CASE WHEN s.class_id = ? THEN ps.selected_count ELSE 0 END), 0) AS selected_count,
                COALESCE(SUM(CASE WHEN s.class_id = ? THEN ps.pass_count ELSE 0 END), 0) AS pass_count
         FROM passages p
         LEFT JOIN passage_stats ps ON ps.passage_id = p.id
         LEFT JOIN students s ON s.id = ps.student_id
         GROUP BY p.id, p.title, p.author
         ORDER BY p.created_at DESC`,
        [classId, classId]
      ) as any[]
    } else {
      rows = await query(
        `SELECT p.id as passage_id,
                p.title,
                p.author,
                COALESCE(SUM(ps.selected_count), 0) AS selected_count,
                COALESCE(SUM(ps.pass_count), 0) AS pass_count
         FROM passages p
         LEFT JOIN passage_stats ps ON ps.passage_id = p.id
         GROUP BY p.id, p.title, p.author
         ORDER BY p.created_at DESC`
      ) as any[]
    }

    const data = rows.map((r) => ({
      passageId: String(r.passage_id),
      title: r.title,
      author: r.author ?? "",
      selectedCount: Number(r.selected_count) || 0,
      passCount: Number(r.pass_count) || 0,
      rate: (Number(r.selected_count) || 0) === 0
        ? 0
        : Math.round((Number(r.pass_count) / Number(r.selected_count)) * 100),
    }))

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("GET /api/stats/passages/summary error:", error)
    return NextResponse.json({ error: error.message || "统计获取失败" }, { status: 500 })
  }
}


