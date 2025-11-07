import { Button } from "@/components/ui/button"

interface PassageStat {
	passageId: string
	title: string
	author?: string
	selectedCount: number
	passCount: number
	rate: number
}

interface PassageStatsSectionProps {
	passagesCount: number
	passageStats: PassageStat[]
	onEditClick: () => void
}

export function PassageStatsSection({
	passagesCount,
	passageStats,
	onEditClick,
}: PassageStatsSectionProps) {
	return (
		<div className="mb-6 rounded-lg border bg-card p-4 shadow-md sm:p-5">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold sm:text-xl">篇目管理</h2>
				<div className="flex items-center gap-3">
					<span className="text-sm text-muted-foreground">数量：{passagesCount}</span>
					<Button variant="outline" onClick={onEditClick}>编辑</Button>
				</div>
			</div>
			{passageStats.length === 0 ? (
				<p className="text-sm text-muted-foreground">暂无篇目统计，点击"编辑"新增篇目。</p>
			) : (
				<div className="-mx-2 overflow-x-auto overflow-y-auto sm:mx-0 max-h-[360px]">
					<table className="w-[640px] sm:w-full text-sm sm:text-base">
						<thead className="sticky top-0 bg-muted">
							<tr className="border-b">
								<th className="p-2 text-left">篇目</th>
								<th className="p-2 text-left">抽查数</th>
								<th className="p-2 text-left">正确率</th>
							</tr>
						</thead>
						<tbody>
							{passageStats.map((p) => (
								<tr key={p.passageId} className="border-b">
									<td className="p-2">{p.title}</td>
									<td className="p-2">{p.selectedCount}</td>
									<td className="p-2">{p.rate}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}




