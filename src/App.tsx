import _plays from './plays.json'
import _invoices from './invoices.json'
import createStatementData, { Invoice, Plays, StatementData } from './createStatementData'

const invoices = _invoices as Invoice[]
const plays = _plays as Plays

function usd(num: number = 0) {
	return new Intl.NumberFormat('en-US',
		{
			style: 'currency', currency: 'USD',
			minimumFractionDigits: 2
		}).format(num / 100)
}

function statement(invoice: Invoice, plays: Plays) {
	return renderPlainText(createStatementData(invoice, plays))
}

function renderPlainText(data: StatementData) {
	let result = `Statement for ${data.customer}\n`
	for (let perf of data.performances) {
		result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`
	}
	result += `Amount owed is ${usd(data.totalAmount)}\n`
	result += `You earned ${(data.totalVolumeCredits)} credits\n`
	return result
}

function htmlStatement(invoice: Invoice, plays: Plays) {
	return renderHtml(createStatementData(invoice, plays))
}

function renderHtml(data: StatementData) {
	return <>
		<h1>Statement for {data.customer}</h1>
		<table>
			<thead>
			<tr>
				<th>play</th>
				<th>seats</th>
				<th>cost</th>
			</tr>
			</thead>
			<tbody>
			{
				data.performances.map(p => <tr key={p.playID}>
					<td>{p.play.name}</td>
					<td>{p.audience}</td>
					<td>{usd(p.amount)}</td>
				</tr>)
			}
			</tbody>
		</table>
		<p>Amount owed is {usd(data.totalAmount)}</p>
		<p>You earned <em>{data.totalVolumeCredits}</em> credits</p>
	</>
}

function App() {
	return (
		<div className='App'>
			{statement(invoices[0], plays)}
			{htmlStatement(invoices[0], plays)}
		</div>
	)
}

export default App
