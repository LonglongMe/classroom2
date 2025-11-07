"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus } from "lucide-react"
import { Class, Student, Passage } from "@/types/lottery"
import { FireworkCenter } from "@/components/ui/firework-center"
import { SortMode } from "./components/SortControls"
import { fetchWithRetry } from "./utils"
import { DrawSection } from "./components/DrawSection"
import { PassageStatsSection } from "./components/PassageStatsSection"
import { StudentsSection } from "./components/StudentsSection"
import { CheckDialog } from "./components/CheckDialog"
import { ClassDialog } from "./components/ClassDialog"
import { PassageDialog } from "./components/PassageDialog"

export default function LotteryPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [currentClassId, setCurrentClassId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [passages, setPassages] = useState<Passage[]>([])
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null)
  const [isStudentSpinning, setIsStudentSpinning] = useState(false)
  const [isPassageSpinning, setIsPassageSpinning] = useState(false)
  const [studentSpinItems, setStudentSpinItems] = useState<string[]>([])
  const [passageSpinItems, setPassageSpinItems] = useState<string[]>([])
  const [pairStat, setPairStat] = useState<{ selectedCount: number; passCount: number } | null>(null)
  const [passageStats, setPassageStats] = useState<{ passageId: string; title: string; author?: string; selectedCount: number; passCount: number; rate: number }[]>([])
  const [passageDialogOpen, setPassageDialogOpen] = useState(false)
  const [newPassageTitle, setNewPassageTitle] = useState("")
  const [newPassageAuthor, setNewPassageAuthor] = useState("")
  const [newPassageContent, setNewPassageContent] = useState("")
  const [creatingPassage, setCreatingPassage] = useState(false)
  const [checkDialogOpen, setCheckDialogOpen] = useState(false)
  const [checkingStudent, setCheckingStudent] = useState<{
    student: Student
    classId: string
  } | null>(null)
  const [checkStartAt, setCheckStartAt] = useState<number | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // 新建/编辑班级对话框相关状态
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [isEditingClass, setIsEditingClass] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [tempClassName, setTempClassName] = useState("")
  const [tempStudents, setTempStudents] = useState<Student[]>([])
  
  // 对话框内的学生管理状态
  const [dialogNewStudentName, setDialogNewStudentName] = useState("")
  const [dialogNewStudentId, setDialogNewStudentId] = useState("")
  // 编辑/新建班级弹窗内，学生姓名支持直接编辑，不需要额外编辑状态
  const [dialogStudentIdPrefix, setDialogStudentIdPrefix] = useState("")
  const [dialogStudentIdStart, setDialogStudentIdStart] = useState("")
  const [dialogStudentIdEnd, setDialogStudentIdEnd] = useState("")
  // 学生列表排序模式：顺序 / 成功率
  const [sortMode, setSortMode] = useState<"order" | "rate">("order")

  const currentClass = classes.find((c) => c.id === currentClassId)

  // 成功率排名（与展示顺序无关）
  const rateRanks = useMemo(() => {
    if (!currentClass) return new Map<string, number>()
    const arr = currentClass.students.map((s) => ({
      id: s.id,
      rate: s.selectedCount === 0 ? 0 : s.passCount / s.selectedCount,
      selected: s.selectedCount || 0,
    }))
    arr.sort((a, b) => {
      if (b.rate !== a.rate) return b.rate - a.rate
      return b.selected - a.selected
    })
    const m = new Map<string, number>()
    arr.forEach((x, i) => m.set(x.id, i))
    return m
  }, [currentClass])

  // 加载班级列表
  useEffect(() => {
    fetchClasses()
  }, [])

  // 加载全局篇目
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithRetry(`/api/passages`, { retries: 2, timeoutMs: 8000 })
        if (!res.ok) throw new Error(`获取篇目失败 (${res.status})`)
        const data = await res.json()
        setPassages(data)
      } catch (e: any) {
        console.error('加载篇目失败:', e)
        setPassages([])
      }
    }
    load()
  }, [])

  // 加载当前班级的篇目统计（篇目与班级无关，但统计与班级相关）
  useEffect(() => {
    const loadStats = async () => {
      if (!currentClassId) { setPassageStats([]); return }
      try {
        const sres = await fetchWithRetry(`/api/stats/passages/summary?classId=${encodeURIComponent(currentClassId)}`, { retries: 2, timeoutMs: 8000 })
        if (!sres.ok) throw new Error(`获取篇目统计失败 (${sres.status})`)
        setPassageStats(await sres.json())
      } catch (e) {
        console.error('加载篇目统计失败:', e)
        setPassageStats([])
      }
    }
    loadStats()
  }, [currentClassId])

  // 加载选中 学生-篇目 的配对统计
  useEffect(() => {
    const loadPair = async () => {
      if (!selectedStudent || !selectedPassage) { setPairStat(null); return }
      try {
        const res = await fetchWithRetry(`/api/stats/passages/pair?studentId=${encodeURIComponent(selectedStudent.id)}&passageId=${encodeURIComponent(selectedPassage.id)}`, { retries: 1, timeoutMs: 6000 })
        if (!res.ok) throw new Error(`配对统计获取失败 (${res.status})`)
        const data = await res.json()
        setPairStat({ selectedCount: Number(data.selectedCount || 0), passCount: Number(data.passCount || 0) })
      } catch {
        setPairStat(null)
      }
    }
    loadPair()
  }, [selectedStudent, selectedPassage])

  // 从API获取所有班级
  const fetchClasses = async () => {
    try {
      const response = await fetchWithRetry("/api/classes", { retries: 3, timeoutMs: 8000 })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.code === "ER_NO_SUCH_TABLE") {
          alert("数据库表未初始化，请先访问 /api/init-db 初始化数据库")
        } else {
          throw new Error(errorData.error || `获取班级列表失败 (${response.status})`)
        }
        return
      }
      const data = await response.json()
      setClasses(data)
      // 默认选中第一个班级（仅在尚未选中时）
      if (!currentClassId && Array.isArray(data) && data.length > 0) {
        setCurrentClassId(String(data[0].id))
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error)
      const msg = String(error?.message || error || "网络异常")
      if (/ECONNRESET|network|fetch|timeout/i.test(msg)) {
        alert("加载班级列表失败：网络不稳定或服务暂时不可用，请稍后重试")
      } else {
        alert("加载班级列表失败：" + msg)
      }
    }
  }

  // 从API获取单个班级详情
  const fetchClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(classId)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `获取班级详情失败 (${response.status})`)
      }
      const data = await response.json()
      // 更新班级列表中的该班级
      setClasses((prev) =>
        prev.map((cls) => (cls.id === classId ? data : cls))
      )
      return data
    } catch (error: any) {
      console.error("Error fetching class:", error)
      throw error // 抛出错误以便调用者处理
    }
  }

  // 打开新建班级对话框
  const handleOpenNewClassDialog = () => {
    setTempClassName("")
    setTempStudents([])
    setIsEditingClass(false)
    setEditingClassId(null)
    setClassDialogOpen(true)
  }

  // 打开编辑班级对话框
  const handleOpenEditClassDialog = async (classId: string) => {
    try {
      const cls = await fetchClass(classId)
      if (!cls) {
        alert("获取班级信息失败")
        return
      }
      
      setTempClassName(cls.name)
      setTempStudents([...cls.students])
      setIsEditingClass(true)
      setEditingClassId(classId)
      setClassDialogOpen(true)
    } catch (error: any) {
      console.error("Error opening edit dialog:", error)
      alert("获取班级信息失败：" + (error.message || "请检查网络连接"))
    }
  }

  // 删除班级
  const handleDeleteClass = async (classId: string) => {
    const classToDelete = classes.find((c) => c.id === classId)
    if (!classToDelete) return

    if (!confirm(`确定要删除班级"${classToDelete.name}"吗？这将同时删除该班级下的所有学生。`)) {
      return
    }

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "删除班级失败")
      }

      // 立即更新本地状态
      setClasses((prev) => prev.filter((cls) => cls.id !== classId))

      // 如果删除的是当前选中的班级，清空选择
      if (currentClassId === classId) {
        setCurrentClassId(null)
        setSelectedStudent(null)
      }
    } catch (error: any) {
      console.error("Error deleting class:", error)
      alert("删除失败：" + error.message)
    }
  }

  // 关闭班级对话框
  const handleCloseClassDialog = () => {
    setClassDialogOpen(false)
    setTempClassName("")
    setTempStudents([])
    setDialogNewStudentName("")
    setDialogNewStudentId("")
    setDialogStudentIdPrefix("")
    setDialogStudentIdStart("")
    setDialogStudentIdEnd("")
  }

  // 在对话框中添加学生
  const handleDialogAddStudent = () => {
    if (!dialogNewStudentName.trim() || !dialogNewStudentId.trim()) return

    const newStudent: Student = {
      id: Date.now().toString(),
      name: dialogNewStudentName.trim(),
      studentId: dialogNewStudentId.trim(),
      selectedCount: 0,
      passCount: 0,
    }

    setTempStudents([...tempStudents, newStudent])
    setDialogNewStudentName("")
    setDialogNewStudentId("")
  }

  // 在对话框中一键生成学生
  const handleDialogGenerateStudents = () => {
    const prefix = dialogStudentIdPrefix.trim()
    const start = parseInt(dialogStudentIdStart.trim())
    const end = parseInt(dialogStudentIdEnd.trim())

    if (isNaN(start) || isNaN(end) || start > end) {
      alert("请输入有效的起始号码和结束号码")
      return
    }

    const students: Student[] = []
    const maxLength = Math.max(start.toString().length, end.toString().length)
    for (let i = start; i <= end; i++) {
      const paddedNum = i.toString().padStart(maxLength, "0")
      const studentId = prefix ? `${prefix}${paddedNum}` : paddedNum
      students.push({
        id: `${Date.now()}-${i}`,
        name: `学生${paddedNum}`,
        studentId,
        selectedCount: 0,
        passCount: 0,
      })
    }

    setTempStudents([...tempStudents, ...students])
    setDialogStudentIdPrefix("")
    setDialogStudentIdStart("")
    setDialogStudentIdEnd("")
  }

  // 在对话框中直接编辑学生姓名
  const handleDialogInlineNameChange = (studentId: string, value: string) => {
    const newName = value
    setTempStudents(
      tempStudents.map((s) => (s.id === studentId ? { ...s, name: newName } : s))
    )
  }

  // 删除对话框中的学生
  const handleDialogDeleteStudent = (studentId: string) => {
    setTempStudents(tempStudents.filter((s) => s.id !== studentId))
  }

  // 保存班级（新建或编辑）
  const handleSaveClass = async () => {
    if (!tempClassName.trim()) {
      alert("请输入班级名称")
      return
    }

    try {
      if (isEditingClass && editingClassId) {
        // 编辑现有班级
        const response = await fetchWithRetry(`/api/classes/${editingClassId}`, {
          retries: 2,
          timeoutMs: 8000,
          init: {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: tempClassName.trim(),
              students: tempStudents,
            }),
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `更新班级失败 (${response.status})`)
        }
        
        // 刷新班级列表
        await fetchClasses()
      } else {
        // 新建班级
        const response = await fetchWithRetry("/api/classes", {
          retries: 2,
          timeoutMs: 8000,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: tempClassName.trim(),
              students: tempStudents,
            }),
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `创建班级失败 (${response.status})`)
        }
        
        const data = await response.json()
        await fetchClasses()
        setCurrentClassId(data.id)
      }

      handleCloseClassDialog()
    } catch (error: any) {
      console.error("Error saving class:", error)
      alert("保存失败：" + error.message)
    }
  }

  // 主页面学生列表为只读显示，无需编辑状态

  // 无内联编辑逻辑

  // 抽签（纯前端操作，不调用数据库）
  const handleDraw = () => {
    if (!currentClass || currentClass.students.length === 0) return
    // 预先决定目标，构建滚动列表，确保最后一个就是目标
    const randomIndex = Math.floor(Math.random() * currentClass.students.length)
    const student = currentClass.students[randomIndex]
    const pool = currentClass.students.map((s) => s.studentId)
    const picks: string[] = []
    for (let i = 0; i < 6; i++) {
      picks.push(pool[Math.floor(Math.random() * pool.length)])
    }
    picks.push(student.studentId)
    setStudentSpinItems(picks)
    setIsStudentSpinning(true)
    // 2s 后展示目标
    setTimeout(() => {
      if (!student || !student.id) {
        console.error("Invalid student data:", student)
        alert("学生数据无效，请刷新页面重试")
        setIsStudentSpinning(false)
        return
      }
      setSelectedStudent(student)
      setIsStudentSpinning(false)
    }, 2000)
  }

  // 抽篇目
  const handleDrawPassage = () => {
    if (!passages || passages.length === 0) return
    const idx = Math.floor(Math.random() * passages.length)
    const target = passages[idx]
    const pool = passages.map((p) => p.title)
    const picks: string[] = []
    for (let i = 0; i < 6; i++) {
      picks.push(pool[Math.floor(Math.random() * pool.length)])
    }
    picks.push(target.title)
    setPassageSpinItems(picks)
    setIsPassageSpinning(true)
    setTimeout(() => {
      setSelectedPassage(target)
      setIsPassageSpinning(false)
    }, 2000)
  }

  // 打开查诵对话框
  const handleOpenCheck = (student: Student) => {
    if (!currentClassId) return
    setCheckingStudent({ student, classId: currentClassId })
    setCheckDialogOpen(true)
    setCheckStartAt(Date.now())
    setElapsedSec(0)
  }

  // 处理查诵结果（立即更新数据库和本地状态）
  const handleCheckResult = async (passed: boolean) => {
    if (!checkingStudent) return

    try {
      const student = checkingStudent.student
      const studentId = String(student.id).trim()
      
      if (!studentId) {
        throw new Error("学生ID为空")
      }

      // 计算新的背诵数和成功数
      const currentSelectedCount = Number(student.selectedCount) || 0
      const currentPassCount = Number(student.passCount) || 0
      
      // 如果是pass，背诵数和成功数都+1；如果是fail，只背诵数+1
      const newSelectedCount = currentSelectedCount + 1
      const newPassCount = passed ? currentPassCount + 1 : currentPassCount

      // 更新数据库（学生总计）
      const response = await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedCount: newSelectedCount,
          passCount: newPassCount,
        }),
      })
      // 若选择了篇目，同时更新学生-篇目的统计
      if (selectedPassage) {
        try {
          const res2 = await fetchWithRetry(`/api/stats/passages`, {
            retries: 2,
            timeoutMs: 8000,
            init: {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: studentId,
                passageId: selectedPassage.id,
                selectedCount: (currentSelectedCount + 1),
                passCount: passed ? (currentPassCount + 1) : currentPassCount,
              })
            }
          })
          if (!res2.ok) {
            console.warn('更新篇目统计失败', await res2.text())
          }
        } catch (e) {
          console.warn('更新篇目统计异常', e)
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `更新失败 (${response.status})`)
      }

      // 立即更新本地状态
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === checkingStudent.classId
            ? {
                ...cls,
                students: cls.students.map((s) =>
                  s.id === student.id
                    ? {
                        ...s,
                        selectedCount: newSelectedCount,
                        passCount: newPassCount,
                      }
                    : s
                ),
              }
            : cls
        )
      )

      // 如果当前选中的学生被查诵，更新显示
      if (selectedStudent?.id === student.id) {
        setSelectedStudent({
          ...student,
          selectedCount: newSelectedCount,
          passCount: newPassCount,
        })
      }

      if (passed) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1500)
      }

      setCheckDialogOpen(false)
      setCheckingStudent(null)
      setCheckStartAt(null)
      setElapsedSec(0)
    } catch (error: any) {
      console.error("Error updating student:", error)
      alert("更新失败：" + error.message)
    }
  }

  // 查诵计时器
  useEffect(() => {
    if (!checkDialogOpen || !checkStartAt) return
    const id = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - checkStartAt) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [checkDialogOpen, checkStartAt])

  return (
    <div className="min-h-screen bg-background">
      {/* 灵动岛式导航栏 */}
      <nav className="sticky top-0 z-50 w-full pt-3">
        <div className="flex justify-center">
          <div className="mx-auto flex h-[52px] items-center justify-between gap-4 rounded-full border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 max-w-2xl w-full">
            {/* 左侧：图标 + 标题 */}
            <div className="flex items-center gap-1 pl-4">
              <Sparkles className="size-5 text-primary sm:size-6" />
            </div>

            {/* 右侧：班级切换 + 新建按钮 */}
            <div className="flex items-center gap-2 sm:gap-3 pr-4">
              {classes.length === 0 ? (
                <span className="text-xs text-muted-foreground sm:text-sm">暂无班级</span>
              ) : (
                <Tabs
                  value={currentClassId || undefined}
                  onValueChange={(value) => setCurrentClassId(value)}
                  className="w-auto"
                >
                  <TabsList>
                    {classes.map((c) => (
                      <TabsTrigger key={c.id} value={c.id}>
                        {c.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
              <Button 
                variant="default" 
                size="icon"
                onClick={handleOpenNewClassDialog}
                className="shrink-0 size-8 sm:size-9 rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                title="新建班级"
              >
                <Plus className="size-3.5 sm:size-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">

        <DrawSection
          currentClass={currentClass}
          selectedStudent={selectedStudent}
          selectedPassage={selectedPassage}
          passages={passages}
          isStudentSpinning={isStudentSpinning}
          isPassageSpinning={isPassageSpinning}
          studentSpinItems={studentSpinItems}
          passageSpinItems={passageSpinItems}
          pairStat={pairStat}
          onDrawStudent={handleDraw}
          onDrawPassage={handleDrawPassage}
          onStartCheck={handleOpenCheck}
        />

        <PassageStatsSection
          passagesCount={passages.length}
          passageStats={passageStats}
          onEditClick={() => setPassageDialogOpen(true)}
        />

        {currentClass && (
          <StudentsSection
            currentClass={currentClass}
            currentClassId={currentClassId}
            sortMode={sortMode}
            rateRanks={rateRanks}
            onSortModeChange={setSortMode}
            onEditClass={() => currentClassId && handleOpenEditClassDialog(currentClassId)}
            onCheckStudent={handleOpenCheck}
          />
        )}

        <CheckDialog
          open={checkDialogOpen}
          onOpenChange={(o) => {
            setCheckDialogOpen(o)
            if (!o) {
              setCheckStartAt(null)
              setElapsedSec(0)
            }
          }}
          checkingStudent={checkingStudent}
          selectedPassage={selectedPassage}
          passageStats={passageStats}
          elapsedSec={elapsedSec}
          onCancel={() => setCheckDialogOpen(false)}
          onResult={handleCheckResult}
        />

        <ClassDialog
          open={classDialogOpen}
          onOpenChange={setClassDialogOpen}
          isEditing={isEditingClass}
          className={tempClassName}
          tempStudents={tempStudents}
          dialogNewStudentName={dialogNewStudentName}
          dialogNewStudentId={dialogNewStudentId}
          dialogStudentIdPrefix={dialogStudentIdPrefix}
          dialogStudentIdStart={dialogStudentIdStart}
          dialogStudentIdEnd={dialogStudentIdEnd}
          onClassNameChange={setTempClassName}
          onAddStudent={handleDialogAddStudent}
          onGenerateStudents={handleDialogGenerateStudents}
          onStudentNameChange={handleDialogInlineNameChange}
          onDeleteStudent={handleDialogDeleteStudent}
          onNewStudentNameChange={setDialogNewStudentName}
          onNewStudentIdChange={setDialogNewStudentId}
          onPrefixChange={setDialogStudentIdPrefix}
          onStartChange={setDialogStudentIdStart}
          onEndChange={setDialogStudentIdEnd}
          onClose={handleCloseClassDialog}
          onSave={handleSaveClass}
          onDelete={isEditingClass && editingClassId ? async () => {
            if (confirm("确定要删除这个班级吗？这将同时删除该班级下的所有学生。")) {
              await handleDeleteClass(editingClassId)
              handleCloseClassDialog()
            }
          } : undefined}
        />

        <PassageDialog
          open={passageDialogOpen}
          onOpenChange={setPassageDialogOpen}
          passages={passages}
          newPassageTitle={newPassageTitle}
          newPassageAuthor={newPassageAuthor}
          newPassageContent={newPassageContent}
          creatingPassage={creatingPassage}
          onTitleChange={setNewPassageTitle}
          onAuthorChange={setNewPassageAuthor}
          onContentChange={setNewPassageContent}
          onCreatePassage={async () => {
            const title = newPassageTitle.trim()
            if (!title) return alert('请输入篇目名称')
            try {
              setCreatingPassage(true)
              const res = await fetchWithRetry('/api/passages', { retries: 2, timeoutMs: 8000, init: {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author: newPassageAuthor.trim(), content: newPassageContent })
              }})
              if (!res.ok) throw new Error(await res.text())
              setNewPassageTitle(''); setNewPassageAuthor(''); setNewPassageContent('')
              // 刷新
              const r1 = await fetchWithRetry(`/api/passages`, { retries: 2, timeoutMs: 8000 })
              if (r1.ok) setPassages(await r1.json())
              const r2 = await fetchWithRetry(`/api/stats/passages/summary?classId=${encodeURIComponent(currentClassId || '')}`, { retries: 2, timeoutMs: 8000 })
              if (r2.ok) setPassageStats(await r2.json())
            } catch (e: any) {
              alert('新增失败：' + (e.message || e))
            } finally {
              setCreatingPassage(false)
            }
          }}
          onDeletePassage={async (passageId: string) => {
            if (!confirm('确定删除该篇目吗？')) return
            try {
              const res = await fetchWithRetry(`/api/passages/${passageId}`, { retries: 2, timeoutMs: 8000, init: { method: 'DELETE' } })
              if (!res.ok) throw new Error(await res.text())
              // 刷新
              const r1 = await fetchWithRetry(`/api/passages`, { retries: 2, timeoutMs: 8000 })
              if (r1.ok) setPassages(await r1.json())
              const r2 = await fetchWithRetry(`/api/stats/passages/summary?classId=${encodeURIComponent(currentClassId || '')}`, { retries: 2, timeoutMs: 8000 })
              if (r2.ok) setPassageStats(await r2.json())
            } catch (e: any) {
              alert('删除失败：' + (e.message || e))
            }
          }}
          onClose={() => setPassageDialogOpen(false)}
        />
      </div>
      {showConfetti && <FireworkCenter />}
    </div>
  )
}
// SegmentedSwitcher 已组件化为 @/components/ui/segmented-switcher

// 居中烟花（基于 box-shadow 粒子）
// moved to @/components/ui/firework-center

// DrawCard 已组件化为 @/components/ui/draw-card

