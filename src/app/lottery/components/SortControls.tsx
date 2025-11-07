import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SortMode = "order" | "rate"

export function SortControls({ sortMode, onChange }: { sortMode: SortMode; onChange: (m: SortMode) => void }) {
	return (
		<Tabs
			value={sortMode}
			onValueChange={(value) => onChange(value as SortMode)}
			className="w-auto"
		>
			<TabsList>
				<TabsTrigger value="order">顺序</TabsTrigger>
				<TabsTrigger value="rate">排名</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}


