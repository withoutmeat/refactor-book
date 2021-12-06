/**
 * 1. 将函数拆分成一组嵌套的函数
 * 2. 分离计算逻辑和输出格式化逻辑
 * 3. 为计算机引入多态特性来处理计算逻辑
 */

export type Play = { name: string, type: 'comedy' | 'tragedy' }
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
		const calculator = createPerformanceCalculator(performance, playFor((performance)))
		const result = { ...performance } as EnrichmentPerformance
		result.play = calculator.play
		result.amount = calculator.amount
		result.volumeCredits = calculator.volumeCredits
		return result
	}

	function playFor(performance: Performance) {
		return plays[performance.playID]
	}

	function totalAmount(data: StatementData) {
		return data.performances.reduce((total, p) => total + p.amount, 0)
	}

	function totalVolumeCredits(data: StatementData) {
		return data.performances.reduce((total, p) => total + p.volumeCredits, 0)
	}
}

function createPerformanceCalculator(performance: Performance, play: Play) {
	switch (play.type) {
		case 'comedy':
			return new ComedyCalculator(performance, play)
		case 'tragedy':
			return new TragedyCalculator(performance, play)
		default:
			throw new Error(`unknown type ${play.type}`)
	}
}

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
	get amount(): number {
		throw new Error('subclass responsibility')
	}

	/**
	 * 观众量积分
	 */
	get volumeCredits() {
		return Math.max(this.performance.audience - 30, 0)
	}
}

class ComedyCalculator extends PerformanceCalculator {
	/**
	 * 演出价格
	 */
	get amount() {
		let result = 30000
		if (this.performance.audience > 20) {
			result += 10000 + 500 * (this.performance.audience - 20)
		}
		result += 300 * this.performance.audience
		return result
	}

	get volumeCredits() {
		// @ts-ignore
		return super.volumeCredits + Math.floor(this.performance.audience / 5)
	}
}

class TragedyCalculator extends PerformanceCalculator {
	/**
	 * 演出价格
	 */
	get amount() {
		let result: number = 40000
		if (this.performance.audience > 30) {
			result += 1000 * (this.performance.audience - 30)
		}
		return result
	}
}

