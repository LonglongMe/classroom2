import { Button } from "@/components/ui/button"
import { SortControls, type SortMode } from "./SortControls"
import { getDisplayStudents, getRankRowStyleByRank } from "../utils"
import type { Class, Student } from "@/types/lottery"

function getSuccessRate(student: Student): number {
	if (student.selectedCount === 0) return 0
	return Math.round((student.passCount / student.selectedCount) * 100)
}

interface StudentsSectionProps {
	currentClass: Class
	currentClassId: string | null
	sortMode: SortMode
	rateRanks: Map<string, number>
	onSortModeChange: (mode: SortMode) => void
	onEditClass: () => void
	onCheckStudent: (student: Student) => void
}

export function StudentsSection({
	currentClass,
	currentClassId,
	sortMode,
	rateRanks,
	onSortModeChange,
	onEditClass,
	onCheckStudent,
}: StudentsSectionProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-4 shadow-md sm:p-6">
				<div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-lg font-semibold sm:text-xl">学生列表</h2>
					<div className="flex items-center gap-2">
						<SortControls onChange={onSortModeChange} sortMode={sortMode} />
						<span className="mx-1 h-6 w-px bg-border" />
						<Button
							variant="outline"
							disabled={!currentClassId}
							aria-disabled={!currentClassId}
							onClick={onEditClass}
							title={currentClassId ? "编辑班级" : "请选择班级后再编辑"}
						>
							编辑
						</Button>
					</div>
				</div>
				{currentClass.students.length === 0 ? (
					<p className="text-muted-foreground">暂无学生</p>
				) : (
					<div className="-mx-2 overflow-x-auto overflow-y-auto sm:mx-0 max-h-[1000px]">
						<table className="w-[640px] sm:w-full text-sm sm:text-base">
							<thead className="sticky top-0 bg-muted">
								<tr className="border-b">
									<th className="p-2 text-left">姓名</th>
									<th className="p-2 text-left">学号</th>
									<th className="p-2 text-left">背诵次数</th>
									<th className="p-2 text-left">正确率</th>
									<th className="p-2 text-left">操作</th>
								</tr>
							</thead>
							<tbody>
								{getDisplayStudents(currentClass, sortMode).map((student) => (
									<tr key={student.id} className="border-b" style={getRankRowStyleByRank(rateRanks.get(student.id))}>
										<td className="p-2">{student.name}</td>
										<td className="p-2">{student.studentId}</td>
										<td className="p-2">{student.selectedCount}</td>
										<td className="p-2">{getSuccessRate(student)}%</td>
										<td className="p-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => onCheckStudent(student)}
											>
												查诵
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
	)
}




