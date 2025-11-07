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
import type { Passage } from "@/types/lottery"

interface PassageDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	passages: Passage[]
	newPassageTitle: string
	newPassageAuthor: string
	newPassageContent: string
	creatingPassage: boolean
	onTitleChange: (title: string) => void
	onAuthorChange: (author: string) => void
	onContentChange: (content: string) => void
	onCreatePassage: () => void
	onDeletePassage: (passageId: string) => void
	onClose: () => void
}

export function PassageDialog({
	open,
	onOpenChange,
	passages,
	newPassageTitle,
	newPassageAuthor,
	newPassageContent,
	creatingPassage,
	onTitleChange,
	onAuthorChange,
	onContentChange,
	onCreatePassage,
	onDeletePassage,
	onClose,
}: PassageDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[96vw] max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>篇目编辑</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="rounded-md border bg-muted/50 p-3">
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<Input 
								placeholder="篇目名称" 
								value={newPassageTitle} 
								onChange={(e) => onTitleChange(e.target.value)} 
							/>
							<Input 
								placeholder="作者（可选）" 
								value={newPassageAuthor} 
								onChange={(e) => onAuthorChange(e.target.value)} 
							/>
							<Button
								disabled={creatingPassage}
								onClick={onCreatePassage}
							>
								{creatingPassage ? '新增中…' : '新增篇目'}
							</Button>
						</div>
						<textarea 
							className="mt-2 w-full rounded-md border p-2 text-sm" 
							rows={5} 
							placeholder="内容（可选）" 
							value={newPassageContent} 
							onChange={(e) => onContentChange(e.target.value)} 
						/>
					</div>

					<div className="-mx-2 overflow-x-auto sm:mx-0">
						<table className="w-[640px] sm:w-full text-sm sm:text-base">
							<thead>
								<tr className="border-b">
									<th className="p-2 text-left">篇目</th>
									<th className="p-2 text-left">作者</th>
									<th className="p-2 text-left">操作</th>
								</tr>
							</thead>
							<tbody>
								{passages.map((p) => (
									<tr key={p.id} className="border-b">
										<td className="p-2">{p.title}</td>
										<td className="p-2">{p.author}</td>
										<td className="p-2">
											<Button 
												size="sm" 
												variant="destructive" 
												onClick={() => onDeletePassage(p.id)}
											>
												删除
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>关闭</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}




