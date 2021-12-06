export type Play = { name: string, type: string }
/**
 * 所有剧目
 */
export type Plays = { othello: Play, 'as-like': Play, hamlet: Play }

export type Performance = {
	/**
	 * 剧目id
	 */
	playID: keyof Plays,
	/**
	 * 观众数量
	 */
	audience: number
}
/**
 * 计算过后的演出数据
 */
export type EnrichmentPerformance = Performance & { play: Play, amount: number, volumeCredits: number }

// 账单
export type Invoice = {
	/**
	 * 客户
	 */
	customer: string,
	/**
	 * 演出
	 */
	performances: Performance[]
}

export type StatementData =
	Omit<Invoice, 'performances'>
	& { performances: EnrichmentPerformance[], totalAmount: number, totalVolumeCredits: number }


class PerformanceCalculator {
	/**
	 * 演出计算器
	 * @param performance 演出
	 * @param play 剧目
	 */
	constructor(public performance: Performance, public play: Play) {
	}

	/**
	 * 演出价格
	 */
	get amount() {
		let result: number = 0
		switch (this.play.type) {
			case 'tragedy':
				result = 40000
				if (this.performance.audience > 30) {
					result += 1000 * (this.performance.audience - 30)
				}
				break
			case 'comedy':
				result = 30000
				if (this.performance.audience > 20) {
					result += 10000 + 500 * (this.performance.audience - 20)
				}
				result += 300 * this.performance.audience
				break
			default:
				throw new Error(`unknown type: ${this.play.type}`)
		}
		return result
	}

	/**
	 * 观众量积分
	 */
	get volumeCredits() {
		let result = 0
		// add volume credits
		result += Math.max(this.performance.audience - 30, 0)
		// add extra credit for every ten comedy attendees
		if ('comedy' === this.play.type) result += Math.floor(this.performance.audience / 5)
		return result
	}
}

export default function createStatementData(invoice: Invoice, plays: Plays) {
	const result = {} as StatementData
	result.customer = invoice.customer
	result.performances = invoice.performances.map(enrichPerformance)
	result.totalAmount = totalAmount(result)
	result.totalVolumeCredits = totalVolumeCredits((result))

	return result

	/**
	 * 填充
	 * @param performance
	 */
	function enrichPerformance(performance: Performance) {
		const calculator = new PerformanceCalculator(performance, playFor(performance))
		const result = { ...performance } as EnrichmentPerformance
		result.play = calculator.play
		result.amount = amountFor(performance)
		result.volumeCredits = volumeCreditsFor((performance))
		return result
	}

	function playFor(performance: Performance) {
		return plays[performance.playID]
	}

	/**
	 * 计算一场演出的费用
	 * @param performance 包含剧目id和观众数量
	 */
	function amountFor(performance: Performance) {
		return new PerformanceCalculator(performance, playFor(performance)).amount
	}

	/**
	 *  计算观众量积分
	 * @param performance 包含剧目id和观众数量
	 */
	function volumeCreditsFor(performance: Performance) {
		return new PerformanceCalculator(performance, playFor(performance)).volumeCredits
	}

	function totalAmount(data: StatementData) {
		return data.performances.reduce((total, p) => total + p.amount, 0)
	}

	function totalVolumeCredits(data: StatementData) {
		return data.performances.reduce((total, p) => total + p.volumeCredits, 0)
	}
}