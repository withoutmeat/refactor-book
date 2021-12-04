import _plays from "./plays.json"
import _invoices from "./invoices.json"

type Play = { name: string, type: string }
/**
 * 所有剧目
 */
type Plays = { othello: Play, "as-like": Play, hamlet: Play }

type Performance = {
  /**
   * 剧目id
   */
  playID: keyof Plays,
  /**
   * 观众数量
   */
  audience: number
}
// 账单
type Invoice = {
  /**
   * 客户
   */
  customer: string,
  /**
   * 演出
   */
  performances: Performance[]
}

const invoices = _invoices as Invoice[]
const plays = _plays as Plays

function playFor(performance: Performance) {
  return plays[performance.playID]
}

/**
 * 计算一场演出的费用
 * @param play 剧目
 * @param performance 包含剧目id和观众数量
 */
function amountFor(play: Play, performance: Performance) {
  let result: number = 0
  switch (play.type) {
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
      throw new Error(`unknown type: ${play.type}`);
  }
  return result;
}

function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat("en-US",
    {
      style: "currency", currency: "USD",
      minimumFractionDigits: 2
    }).format;
  for (let perf of invoice.performances) {
    let thisAmount = amountFor(playFor(perf), perf);

    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === playFor(perf).type) volumeCredits += Math.floor(perf.audience / 5);

    // print line for this order
    result += ` ${playFor(perf).name}: ${format(thisAmount / 100)} (${perf.audience} seats)\r\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}

function App() {
  return (
    <div className="App">
      {statement(invoices[0], plays)}
    </div>
  );
}

export default App;
