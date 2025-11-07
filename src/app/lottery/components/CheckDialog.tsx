import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from "@/components/ui/dialog"
import type { Student, Passage } from "@/types/lottery"

interface PassageStat {
	passageId: string
	selectedCount: number
	rate: number
}

interface CheckDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	checkingStudent: { student: Student; classId: string } | null
	selectedPassage: Passage | null
	passageStats: PassageStat[]
	elapsedSec: number
	onCancel: () => void
	onResult: (passed: boolean) => void
}

function formatElapsed(sec: number): string {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	const mm = m.toString().padStart(2, "0")
	const ss = s.toString().padStart(2, "0")
	return `${mm}:${ss}`
}

export function CheckDialog({
	open,
	onOpenChange,
	checkingStudent,
	selectedPassage,
	passageStats,
	elapsedSec,
	onCancel,
	onResult,
}: CheckDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[92vw] max-w-md sm:max-w-lg">
				{checkingStudent && selectedPassage && (
					<div className="space-y-3 py-3 sm:space-y-4 sm:py-4">
						<div className="flex items-center justify-between">
							{/* 篇目信息 */}
							<div>
								<div className="text-xl font-bold sm:text-3xl">{selectedPassage.title}</div>
								<div className="text-xs text-muted-foreground">
									次数: {passageStats.find(p => p.passageId === selectedPassage.id)?.selectedCount ?? 0}
									<span className="mx-2">|</span>
									成功率: {passageStats.find(p => p.passageId === selectedPassage.id)?.rate ?? 0}%
								</div>
							</div>
							{/* 用时 */}
							<span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
								用时 {formatElapsed(elapsedSec)}
							</span>
						</div>

						{/* 学生信息（无"学号/姓名"字样） */}
						<div className="space-y-1">
							<div className="text-2xl font-bold leading-none">{checkingStudent.student.studentId}</div>
							<div className="text-base sm:text-lg">{checkingStudent.student.name}</div>
						</div>
					</div>
				)}
				<DialogFooter className="flex-row justify-between gap-2 sm:justify-end">
					<Button
						size="lg"
						variant="outline"
						className="flex-1 sm:flex-none"
						onClick={onCancel}
					>
						取消
					</Button>
					<Button
						size="lg"
						variant="destructive"
						className="flex-1 sm:flex-none"
						onClick={() => onResult(false)}
					>
						不通过
					</Button>
					<Button
						size="lg"
						className="flex-1 sm:flex-none"
						onClick={() => onResult(true)}
					>
						通过
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

