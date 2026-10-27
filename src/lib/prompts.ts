import { formatMoney, formatRate, formatSignedRate, formatWeight } from './format'
import { summarize, withMetrics, type Holding } from './portfolio'

export function buildHoldingsText(holdings: Holding[]): string {
  const rows = withMetrics(holdings)
  if (rows.length === 0) return ''

  const summary = summarize(holdings)
  const lines = rows.map(
    (item, index) =>
      `${index + 1}. ${item.name}：市值 ${formatMoney(item.marketValue)} 元，收益 ${formatMoney(
        item.profit,
      )} 元，收益率 ${formatRate(item.rate)}，收益贡献 ${formatSignedRate(
        item.contribution,
      )}，占组合 ${formatWeight(item.weight)}`,
  )

  return [
    `当前持仓共 ${rows.length} 只基金。`,
    `组合总市值 ${formatMoney(summary.totalMarketValue)} 元，总收益 ${formatMoney(
      summary.totalProfit,
    )} 元，总收益率 ${formatRate(summary.totalRate)}。`,
    ...lines,
  ].join('\n')
}

export function chatSystemPrompt(holdingsText: string): string {
  return `你是「基金持仓体检」的持仓助手，负责根据用户当前持仓数据回答问题。请严格遵守以下规则：
1. 回答中出现的每一个数字都必须来自下方提供的持仓数据，严禁编造、估算或补充任何数据里没有的数字。
2. 若用户询问的数据在下方持仓数据中不存在，请直接回答「当前持仓数据里没有这一项」。
3. 回答简洁、专业，使用中文，语气友好。
4. 不要给出具体的买卖建议，可做客观的信息整理。

【当前持仓数据】\n${holdingsText}`
}

export function clientCardPrompt(holdingsText: string): string {
  return `你是一位专业的银行客户经理，现在要根据客户当前基金持仓数据，生成一段发给客户的沟通文案。请严格遵守：
1. 文案总字数控制在 150-200 字之间，写成一段自然连贯的话，绝对不要分点罗列，不要用书面报告腔，语气像银行客户经理跟客户日常说话。
2. 文案分四层：第一层用一句话说清组合整体表现（必须包含总市值、总收益、总收益率这三个数字）；第二层点名拖累最大的那只基金，说明它的仓位占比和拖累幅度；第三层给出一条具体的操作建议；第四层以「以上为持仓信息整理，不构成投资建议」结尾。
3. 文案中出现的每一个数字都必须来自下方提供的持仓数据，严禁编造、估算或补充任何数据里没有的数字。

【当前持仓数据】\n${holdingsText}`
}
