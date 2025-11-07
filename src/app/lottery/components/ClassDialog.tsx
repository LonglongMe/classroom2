"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import type { Student } from "@/types/lottery"

interface ClassDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	isEditing: boolean
	className: string
	tempStudents: Student[]
	dialogNewStudentName: string
	dialogNewStudentId: string
	dialogStudentIdPrefix: string
	dialogStudentIdStart: string
	dialogStudentIdEnd: string
	onClassNameChange: (name: string) => void
	onAddStudent: () => void
	onGenerateStudents: () => void
	onStudentNameChange: (studentId: string, name: string) => void
	onDeleteStudent: (studentId: string) => void
	onNewStudentNameChange: (name: string) => void
	onNewStudentIdChange: (id: string) => void
	onPrefixChange: (prefix: string) => void
	onStartChange: (start: string) => void
	onEndChange: (end: string) => void
	onClose: () => void
	onSave: () => void
	onDelete?: () => void
}

export function ClassDialog({
	open,
	onOpenChange,
	isEditing,
	className,
	tempStudents,
	dialogNewStudentName,
	dialogNewStudentId,
	dialogStudentIdPrefix,
	dialogStudentIdStart,
	dialogStudentIdEnd,
	onClassNameChange,
	onAddStudent,
	onGenerateStudents,
	onStudentNameChange,
	onDeleteStudent,
	onNewStudentNameChange,
	onNewStudentIdChange,
	onPrefixChange,
	onStartChange,
	onEndChange,
	onClose,
	onSave,
	onDelete,
}: ClassDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-screen h-dvh max-w-none sm:h-auto sm:w-[96vw] sm:max-w-4xl sm:rounded-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "编辑班级" : "新建班级"}
					</DialogTitle>
				</DialogHeader>
				
				<div className="space-y-6 py-3 sm:py-4">
					{/* 班级名称 */}
					<div>
						<label className="mb-2 block text-sm font-medium">班级名称</label>
						<Input
							placeholder="输入班级名称"
							value={className}
							onChange={(e) => onClassNameChange(e.target.value)}
						/>
					</div>

					{/* 一键生成学生列表 */}
					<div className="rounded-md border bg-muted/50 p-3 sm:p-4">
						<h4 className="mb-3 text-base font-medium">一键按学号生成学生列表</h4>
						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
							<Input
								placeholder="学号前缀（可选，如：2024）"
								value={dialogStudentIdPrefix}
								onChange={(e) => onPrefixChange(e.target.value)}
								className="w-full sm:w-32"
							/>
							<Input
								placeholder="起始号码"
								type="number"
								value={dialogStudentIdStart}
								onChange={(e) => onStartChange(e.target.value)}
								className="w-full sm:w-24"
							/>
							<span className="flex items-center">到</span>
							<Input
								placeholder="结束号码"
								type="number"
								value={dialogStudentIdEnd}
								onChange={(e) => onEndChange(e.target.value)}
								className="w-full sm:w-24"
							/>
							<Button onClick={onGenerateStudents} className="w-full sm:w-auto">一键生成</Button>
						</div>
						<p className="mt-2 text-xs text-muted-foreground">
							例如：前缀"2024"（可选），起始1，结束50，将生成2024001到20240050的学生；如无前缀，将生成0001到0050
						</p>
					</div>

					{/* 手动添加学生 */}
					<div>
						<h4 className="mb-2 text-base font-medium">手动添加学生</h4>
						<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
							<Input
								placeholder="学生姓名"
								value={dialogNewStudentName}
								onChange={(e) => onNewStudentNameChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && dialogNewStudentId.trim()) {
										onAddStudent()
									}
								}}
								className="w-full"
							/>
							<Input
								placeholder="学号"
								value={dialogNewStudentId}
								onChange={(e) => onNewStudentIdChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && dialogNewStudentName.trim()) {
										onAddStudent()
									}
								}}
								className="w-full"
							/>
							<Button onClick={onAddStudent} className="w-full sm:w-auto">添加</Button>
						</div>
					</div>

					{/* 学生列表 */}
					<div>
						<h4 className="mb-3 text-base font-medium">
							学生列表 ({tempStudents.length})
						</h4>
						{tempStudents.length === 0 ? (
							<p className="text-muted-foreground">暂无学生</p>
						) : (
							<div className="max-h-96 overflow-y-auto rounded-md border -mx-2 sm:mx-0">
								<table className="w-[520px] sm:w-full text-sm sm:text-base">
									<thead className="sticky top-0 bg-muted">
										<tr className="border-b">
											<th className="p-2 text-left">姓名</th>
											<th className="p-2 text-left">学号</th>
											<th className="p-2 text-left">操作</th>
										</tr>
									</thead>
									<tbody>
										{tempStudents.map((student) => (
											<tr key={student.id} className="border-b">
												<td className="p-2">
													<Input
														value={student.name}
														onChange={(e) =>
															onStudentNameChange(student.id, e.target.value)
														}
														className="h-9 w-[12ch] sm:h-8"
													/>
												</td>
												<td className="p-2">{student.studentId}</td>
												<td className="p-2">
													<Button
														size="sm"
														variant="destructive"
														onClick={() => onDeleteStudent(student.id)}
													>
														删除
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						取消
					</Button>
					{/* 编辑模式下显示删除按钮 */}
					{isEditing && onDelete && (
						<Button
							variant="destructive"
							onClick={onDelete}
						>
							删除
						</Button>
					)}
					<Button onClick={onSave}>
						{isEditing ? "保存修改" : "添加"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}




