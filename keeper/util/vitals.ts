export const getVitalsScore = (value: number, min: number, max: number) => (
	value <= min
	? 'good'
	: value <= max
	? 'needs-improvement'
	: 'poor'
)
