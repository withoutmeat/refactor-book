export type Play = { name: string, type: string }
/**
 * 所有剧目
 */
export type Plays = { othello: Play, "as-like": Play, hamlet: Play }

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
    const result = {...performance} as EnrichmentPerformance
    result.play = playFor(performance)
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
    let result: number = 0
    switch (playFor(performance).type) {
      case "tragedy":
        result = 40000;
        if (performance.audience > 30) {
          result += 1000 * (performance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (performance.audience > 20) {
          result += 10000 + 500 * (performance.audience - 20);
        }
        result += 300 * performance.audience;
        break;
      default:
        throw new Error(`unknown type: ${playFor(performance).type}`);
    }
    return result;
  }

  /**
   *  计算观众量积分
   * @param perf 包含剧目id和观众数量
   */
  function volumeCreditsFor(perf: Performance) {
    let result = 0
    // add volume credits
    result += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === playFor(perf).type) result += Math.floor(perf.audience / 5);
    return result;
  }

  function totalAmount(data: StatementData) {
    return data.performances.reduce((total, p) => total + p.amount, 0)
  }

  function totalVolumeCredits(data: StatementData) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0)
  }
}

