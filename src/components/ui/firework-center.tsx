export function FireworkCenter() {
	const buildShadows = (num: number, radius: number) => {
		const shadows: string[] = []
		for (let i = 0; i < num; i++) {
			const angle = Math.random() * Math.PI * 2
			const dist = Math.random() * radius
			const x = Math.cos(angle) * dist
			const y = -Math.sin(angle) * dist * 0.85
			const hue = Math.floor(Math.random() * 360)
			shadows.push(`${x}px ${y}px hsl(${hue},100%,50%)`)
		}
		return shadows.join(", ")
	}
	const style = {
		"--fw-start": "0 0 #fff",
		"--fw-shadows": buildShadows(60, 220),
		"--fw-duration": "1000ms",
		"--fw-fall": "1100ms",
		"--fw-fall-distance": "220px",
	} as React.CSSProperties & Record<string, string>
	return (
		<div className="firework-center">
			<span className="firework-dot" style={style} />
		</div>
	)
}



