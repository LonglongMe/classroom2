import { DrawCard } from "@/components/ui/draw-card"
import type { Class, Student, Passage } from "@/types/lottery"

function getSuccessRate(student: Student): number {
	if (student.selectedCount === 0) return 0
	return Math.round((student.passCount / student.selectedCount) * 100)
}

interface DrawSectionProps {
	currentClass: Class | undefined
	selectedStudent: Student | null
	selectedPassage: Passage | null
	passages: Passage[]
	isStudentSpinning: boolean
	isPassageSpinning: boolean
	studentSpinItems: string[]
	passageSpinItems: string[]
	pairStat: { selectedCount: number; passCount: number } | null
	onDrawStudent: () => void
	onDrawPassage: () => void
	onStartCheck: (student: Student) => void
}

export function DrawSection({
	currentClass,
	selectedStudent,
	selectedPassage,
	passages,
	isStudentSpinning,
	isPassageSpinning,
	studentSpinItems,
	passageSpinItems,
	pairStat,
	onDrawStudent,
	onDrawPassage,
	onStartCheck,
}: DrawSectionProps) {
	return (
		<div className="mb-6 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
			<h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">抽签</h2>
			<div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:1fr_1fr_auto_1fr]">
				{/* 左：学生抽签（共用组件） */}
				<DrawCard
					disabled={!currentClass || currentClass.students.length === 0}
					onClick={onDrawStudent}
					emptyTitle="点击抽学生"
					selectedPrimary={selectedStudent?.studentId}
					selectedSecondary={undefined}
					secondaryLines={selectedStudent ? [
						selectedStudent.name,
						`次数 ${selectedStudent.selectedCount}  正确率 ${getSuccessRate(selectedStudent)}%`
					] : undefined}
					hint={undefined}
					primarySizeClass="text-3xl"
					isSpinning={isStudentSpinning}
					spinItems={studentSpinItems}
					variant="green"
				/>

				{/* 中：篇目抽签（共用组件） */}
				<DrawCard
					disabled={passages.length === 0}
					onClick={onDrawPassage}
					emptyTitle={passages.length === 0 ? '暂无篇目' : '点击抽篇目'}
					selectedPrimary={selectedPassage?.title}
					selectedSecondary={selectedPassage?.author}
					hint={undefined}
					primarySizeClass="text-2xl"
					isSpinning={isPassageSpinning}
					spinItems={passageSpinItems}
					variant="yellow"
				/>

				{/* 箭头（夹在开始查诵左侧，仅桌面显示） */}
				<div className="hidden items-center justify-center text-2xl text-muted-foreground sm:flex">→</div>

				{/* 右：查诵（整卡可点） */}
				<div
					role="button"
					tabIndex={0}
					onClick={() => (selectedStudent && selectedPassage) && onStartCheck(selectedStudent)}
					onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && selectedStudent && selectedPassage) { e.preventDefault(); onStartCheck(selectedStudent) } }}
					aria-disabled={!(selectedStudent && selectedPassage)}
					className={`relative rounded-lg border p-4 outline-none transition-colors flex flex-col justify-center items-center text-center ${!(selectedStudent && selectedPassage) ? 'bg-muted/40 cursor-not-allowed text-muted-foreground' : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'}`}
				>
					{!(selectedStudent && selectedPassage) ? (
						<div className="text-sm">请选择学生与篇目后进行查诵</div>
					) : (
						<>
							<div className="text-xl font-bold uppercase tracking-wide">开始背诵</div>
							{pairStat ? (
								<div className="absolute bottom-2 right-2 text-right text-xs text-muted-foreground">
									{pairStat.selectedCount === 0
										? '未背诵过该篇目'
										: `背诵过 ${pairStat.selectedCount} 次，${pairStat.passCount > 0 ? '曾通过' : '尚未通过'}`}
								</div>
							) : null}
						</>
					)}
				</div>
			</div>
		</div>
	)
}



