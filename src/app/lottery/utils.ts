import type { Class } from "@/types/lottery"

export async function fetchWithTimeout(resource: RequestInfo | URL, opts?: { timeoutMs?: number; init?: RequestInit }) {
	const { timeoutMs = 8000, init } = opts || {}
	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), timeoutMs)
	try {
		return await fetch(resource, { ...init, signal: controller.signal, cache: "no-store" })
	} finally {
		clearTimeout(id)
	}
}

export async function fetchWithRetry(resource: RequestInfo | URL, opts?: { retries?: number; timeoutMs?: number; init?: RequestInit }) {
	const retries = opts?.retries ?? 2
	const timeoutMs = opts?.timeoutMs ?? 8000
	const init = opts?.init
	let lastErr: unknown
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const res = await fetchWithTimeout(resource, { timeoutMs, init })
			return res
		} catch (err) {
			lastErr = err
			if (attempt === retries) break
			const backoff = Math.min(2000 * Math.pow(2, attempt), 6000)
			await new Promise((r) => setTimeout(r, backoff))
		}
	}
	throw lastErr
}

export function getDisplayStudents(currentClass: Class, sortMode: "order" | "rate") {
	if (sortMode === "order") return currentClass.students
	const copy = [...currentClass.students]
	copy.sort((a, b) => {
		const ra = a.selectedCount === 0 ? 0 : a.passCount / a.selectedCount
		const rb = b.selectedCount === 0 ? 0 : b.passCount / b.selectedCount
		if (rb !== ra) return rb - ra
		return (b.selectedCount || 0) - (a.selectedCount || 0)
	})
	return copy
}

export function getRankRowStyleByRank(rank?: number): React.CSSProperties | undefined {
	if (rank === 0) return { backgroundColor: "#FFF4CC" }
	if (rank === 1) return { backgroundColor: "#F2F2F2" }
	if (rank === 2) return { backgroundColor: "#F9E9DD" }
	return undefined
}



