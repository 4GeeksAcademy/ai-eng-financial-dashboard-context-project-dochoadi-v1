// Baseline characterization, not an acceptance suite; defects are expected here.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '')
const { createServer } = await import(pathToFileURL(`${root}/frontend/node_modules/vite/dist/node/index.js`))
const server = await createServer({
  root: `${root}/frontend`,
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, entries: [] },
  appType: 'custom',
})

try {
  const utils = await server.ssrLoadModule('/src/lib/financial-utils.ts')
  const movement = {
    create_date: '2026-01-01', amount: 100, operation_type: 'income',
    category: 'sales', business_type: 'B2B',
  }
  const expectedMonths = { UTC: 'Jan 2026', 'America/Los_Angeles': 'Dec 2025' }
  assert.ok(process.env.TZ in expectedMonths, 'Run with TZ=UTC or TZ=America/Los_Angeles')
  const point = utils.computeMonthlyData([movement])[0]
  assert.equal(point.month, expectedMonths[process.env.TZ])
  console.log('F01:', process.env.TZ, '2026-01-01 ->', point.month)

  const cents = utils.computeKPIs([{ ...movement, amount: 0.1 }, { ...movement, amount: 0.2 }])
  assert.notEqual(cents.totalIncome, 0.3)
  console.log('F02: income 0.1 + 0.2 ->', cents.totalIncome)

  const unknown = { ...movement, operation_type: 'refund' }
  assert.equal(utils.computeKPIs([unknown]).totalOutcome, 0)
  assert.equal(utils.computeMonthlyData([unknown])[0].outcome, 100)
  console.log('F03: malformed refund -> KPI outcome=0, monthly outcome=100')

  if (process.env.TZ === 'UTC') {
    const { default: React } = await import(pathToFileURL(`${root}/frontend/node_modules/react/index.js`))
    const { renderToStaticMarkup } = await import(pathToFileURL(`${root}/frontend/node_modules/react-dom/server.node.js`))
    const { ProfitPercentChart } = await server.ssrLoadModule('/src/components/dashboard/profit-percent-chart.tsx')
    const balanced = utils.computeMonthlyData([movement, { ...movement, operation_type: 'outcome' }])
    assert.equal(balanced[0].profitPercent, 0)
    const html = renderToStaticMarkup(React.createElement(ProfitPercentChart, { data: balanced, loading: false }))
    assert.ok(html.includes('No data available to display'))
    console.log('F04: real ProfitPercentChart renders no-data for income=outcome=100')

    const { CardTitle } = await server.ssrLoadModule('/src/components/ui/card.tsx')
    const title = renderToStaticMarkup(React.createElement(CardTitle, null, 'Title'))
    assert.ok(title.startsWith('<div'))
    console.log('F05: real CardTitle renders div, not heading')

    const { cn } = await server.ssrLoadModule('/src/lib/utils.ts')
    assert.equal(cn('px-6', false, 'px-4'), 'px-4')
    console.log('F06: cn merges px-6 + px-4 -> px-4')

    const app = readFileSync(`${root}/frontend/src/App.tsx`, 'utf8')
    assert.ok(app.includes('period="2024 - Full Year"'))
    assert.ok(!app.includes('AbortController'))
    assert.ok(!app.includes('role="alert"') && !app.includes('aria-live'))
    console.log('F07: source: fixed header, no AbortController, no alert/live region')
  }
} finally {
  await server.close()
}
