import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT - 更新学生信息（背诵数和成功数）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 16 可能需要await params
    const resolvedParams = params instanceof Promise ? await params : params
    let studentId = resolvedParams?.id
    
    // 如果 params.id 不存在，尝试从 URL 中提取
    if (!studentId) {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      studentId = pathParts[pathParts.length - 1]
    }
    
    // 解码URL编码的ID（如果有）
    const decodedId = studentId ? decodeURIComponent(studentId) : null
    
    if (!decodedId || decodedId === 'undefined' || decodedId === 'null' || decodedId.trim() === '') {
      console.error("Invalid student ID:", { 
        params, 
        studentId, 
        decodedId, 
        url: request.url 
      })
      return NextResponse.json(
        { error: "学生ID不能为空" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { selectedCount, passCount, name } = body

    const updates: string[] = []
    const values: any[] = []

    // selectedCount 对应数据库中的 selected_count（背诵数）
    if (selectedCount !== undefined && selectedCount !== null) {
      const numValue = Number(selectedCount)
      if (!isNaN(numValue)) {
        updates.push("selected_count = ?")
        values.push(numValue)
      }
    }

    // passCount 对应数据库中的 pass_count（成功数）
    if (passCount !== undefined && passCount !== null) {
      const numValue = Number(passCount)
      if (!isNaN(numValue)) {
        updates.push("pass_count = ?")
        values.push(numValue)
      }
    }

    if (name !== undefined && name !== null) {
      updates.push("name = ?")
      values.push(String(name))
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "没有要更新的字段" },
        { status: 400 }
      )
    }

    values.push(String(decodedId))

    // 验证所有值都不是 undefined
    const hasUndefined = values.some(v => v === undefined)
    if (hasUndefined) {
      console.error("Found undefined values in update:", { updates, values, body })
      return NextResponse.json(
        { error: "更新参数包含无效值" },
        { status: 400 }
      )
    }

    try {
      await query(
        `UPDATE students SET ${updates.join(", ")} WHERE id = ?`,
        values
      )
    } catch (dbError: any) {
      console.error("Database error updating student:", dbError)
      // 检查是否是字段不存在错误
      if (dbError.code === "ER_BAD_FIELD_ERROR") {
        return NextResponse.json(
          { 
            error: `数据库字段不存在: ${dbError.sqlMessage}`,
            details: "请检查数据库表结构，确保存在 selected_count 和 pass_count 字段"
          },
          { status: 500 }
        )
      }
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      { 
        error: error.message || "更新学生信息失败",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

