import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { Class } from "@/types/lottery"

// GET - 获取所有班级
export async function GET() {
  try {
    const classes = await query(`
      SELECT 
        c.id,
        c.name,
        COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id, c.name
      ORDER BY c.created_at DESC
    `) as any[]

    // 检查是否是表不存在错误
    if (Array.isArray(classes)) {
      // 获取每个班级的学生列表
      const classesWithStudents = await Promise.all(
        classes.map(async (cls) => {
          const students = await query(
            `SELECT id, name, student_id, selected_count, pass_count 
             FROM students 
             WHERE class_id = ? 
             ORDER BY student_id`,
            [cls.id]
          ) as any[]

          // 调试：检查学生数据的结构
          if (students.length > 0 && !students[0].id) {
            console.error("Student data structure issue:", students[0])
            console.error("Available fields:", Object.keys(students[0] || {}))
          }

          return {
            id: cls.id,
            name: cls.name,
            students: students
              .filter((s) => {
                // 检查是否有id字段（可能是不同的字段名）
                const hasId = s.id || s.ID || s.Id
                if (!hasId) {
                  console.warn("Student without ID:", s)
                }
                return hasId
              })
              .map((s) => {
                // 尝试多种可能的ID字段名
                const studentId = s.id || s.ID || s.Id || String(s.id || '')
                return {
                  id: String(studentId),
                  name: s.name || s.NAME || '',
                  studentId: s.student_id || s.student_Id || s.STUDENT_ID || '',
                  selectedCount: Number(s.selected_count || s.selected_Count || s.SELECTED_COUNT || 0) || 0,
                  passCount: Number(s.pass_count || s.pass_Count || s.PASS_COUNT || 0) || 0,
                }
              }),
          } as Class
        })
      )

      return NextResponse.json(classesWithStudents)
    } else {
      throw new Error("查询结果格式错误")
    }
  } catch (error: any) {
    console.error("Error fetching classes:", error)
    // 检查是否是表不存在错误
    if (error.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        { 
          error: "数据库表未初始化，请先访问 /api/init-db 初始化数据库",
          code: "ER_NO_SUCH_TABLE"
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { 
        error: error.message || "获取班级列表失败",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST - 创建新班级
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, students = [] } = body

    if (!name) {
      return NextResponse.json(
        { error: "班级名称不能为空" },
        { status: 400 }
      )
    }

    const classId = Date.now().toString()

    // 创建班级
    try {
      await query(
        `INSERT INTO classes (id, name) VALUES (?, ?)`,
        [classId, name]
      )
    } catch (dbError: any) {
      console.error("Database error creating class:", dbError)
      // 检查是否是表不存在错误
      if (dbError.code === "ER_NO_SUCH_TABLE") {
        return NextResponse.json(
          { error: "数据库表未初始化，请先访问 /api/init-db 初始化数据库" },
          { status: 500 }
        )
      }
      throw dbError
    }

    // 创建学生
    if (students.length > 0) {
      for (const s of students) {
        try {
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
        } catch (studentError: any) {
          console.error("Error creating student:", studentError, s)
          // 如果是唯一约束错误，提供更友好的提示
          if (studentError.code === "ER_DUP_ENTRY") {
            throw new Error(`学号 ${s.studentId} 在同一班级中已存在`)
          }
          throw studentError
        }
      }
    }

    return NextResponse.json({ id: classId, name, students })
  } catch (error: any) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { 
        error: error.message || "创建班级时发生未知错误",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

