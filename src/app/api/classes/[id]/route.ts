import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET - 获取单个班级详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 16 可能需要await params
    const resolvedParams = params instanceof Promise ? await params : params
    const classId = resolvedParams.id

    if (!classId) {
      console.error("Class ID is missing:", { params: resolvedParams, url: request.url })
      return NextResponse.json(
        { error: "班级ID不能为空" },
        { status: 400 }
      )
    }

    // 获取班级信息
    const classes = await query(
      `SELECT id, name FROM classes WHERE id = ?`,
      [classId]
    ) as any[]

    if (classes.length === 0) {
      return NextResponse.json(
        { error: "班级不存在" },
        { status: 404 }
      )
    }

    // 获取学生列表
    const students = await query(
      `SELECT id, name, student_id, selected_count, pass_count 
       FROM students 
       WHERE class_id = ? 
       ORDER BY student_id`,
      [classId]
    ) as any[]

    return NextResponse.json({
      id: classes[0].id,
      name: classes[0].name,
      students: students
        .filter((s) => s.id) // 过滤掉没有ID的学生
        .map((s) => ({
          id: String(s.id), // 确保ID是字符串
          name: s.name,
          studentId: s.student_id,
          selectedCount: Number(s.selected_count) || 0,
          passCount: Number(s.pass_count) || 0,
        })),
    })
  } catch (error: any) {
    console.error("Error fetching class:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT - 更新班级
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const classId = resolvedParams.id

    if (!classId) {
      return NextResponse.json(
        { error: "班级ID不能为空" },
        { status: 400 }
      )
    }
    const body = await request.json()
    const { name, students } = body

    // 更新班级名称
    if (name) {
      await query(
        `UPDATE classes SET name = ? WHERE id = ?`,
        [name, classId]
      )
    }

    // 更新学生列表
    if (students !== undefined) {
      // 先删除所有现有学生
      await query(`DELETE FROM students WHERE class_id = ?`, [classId])

      // 重新插入学生
      if (students.length > 0) {
        for (const s of students) {
          await query(
            `INSERT INTO students (id, class_id, name, student_id, selected_count, pass_count) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              s.id,
              classId,
              s.name,
              s.studentId,
              s.selectedCount || 0,
              s.passCount || 0,
            ]
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - 删除班级
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const classId = resolvedParams.id

    if (!classId) {
      return NextResponse.json(
        { error: "班级ID不能为空" },
        { status: 400 }
      )
    }

    // 删除班级（会自动删除关联的学生，因为设置了ON DELETE CASCADE）
    await query(`DELETE FROM classes WHERE id = ?`, [classId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

