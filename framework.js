/**
 * Growth Strategy Framework - prompt builder and instructions
 */

const FRAMEWORK = `
You are an expert growth strategist using a structured full-funnel growth framework. Generate a DETAILED, PERSONALIZED growth strategy. The output must NEVER be generic.

## Anti-Generic Rules
- Forbidden: "Consider focusing on retention", "Leverage viral loops", "Improve activation" without naming WHAT and HOW for this product
- Required: Name the company, product, and features in every section
- Required: Tie each recommendation to a specific metric, flow, or feature
- Required: Call out competitor-specific tactics when relevant
- Required: Address constraints (budget, regulation, etc.) explicitly

## Framework Phases (apply to the company provided)
1. Retention: Use case (problem, persona, frequency, core action); retention metric; cohorts
2. Engagement: Organic habit loop (trigger, action, reward); manufactured + environment loops; activation; resurrection
3. Acquisition: Loops (viral, content, paid, sales); product-channel fit; model-channel fit; three levers
4. Monetization: Four fits; pricing; friction balance
5. Growth Model: Qualitative model (output, habit loops, acquisition loops, linear)
6. User Psychology: ELMR/Psych applied to 1-2 named flows
7. Experiments: 3+ MVTs with problem, hypothesis, evidence, prediction, success metric, tradeoff metric
8. Defensibility: Which forms apply and how to strengthen

## Formatting Rules
- Never use em-dashes (—). Use hyphens (-), colons (:), or commas (,) instead.
- Tables: No cell may be empty. Every header and every data cell must contain content. The first column header must name the row dimension (e.g., "Parameter", "Experiment", "Action"); every first-column body cell must have a value. Never use \`| | Col2 |\` or leave any cell blank.
`;

const OUTPUT_STRUCTURE = `
## Output Document Structure (follow exactly)

1. **Executive Summary**: 2-3 paragraphs; company name, product, market; key growth thesis; top 3 priorities; constraints acknowledged
2. **Company & Product Context**: Recap of product, features, market, competitors, stage; assumptions
3. **Retention Strategy**: Use case for this product; retention metric; cohort implications; feature-level retention impact
4. **Engagement & Habit Loops**: Organic loop tailored to product; manufactured + environment tactics; activation; resurrection
5. **Acquisition Strategy**: Loops applicable with fit reasoning; order of operations; competitor context
6. **Monetization Strategy**: Four fits; pricing levers; friction tradeoffs
7. **Growth Model**: Qualitative model (diagram or step list)
8. **User Psychology**: ELMR/Psych for 1-2 named flows; +/- psych by step
9. **Experiments**: 3+ MVTs with full structure; prioritized
10. **Defensibility**: Which forms apply; how to strengthen
11. **Prioritized Action Plan**: 5-10 actions with owners, order, impact
`;

export function buildPrompt(companyInfo) {
  const isJson = typeof companyInfo === 'object';
  const companyText = isJson ? formatStructuredInput(companyInfo) : companyInfo;

  return `Generate a detailed, personalized growth strategy for the following company/product. Use the growth strategy framework described below. Every recommendation must reference the specific company, product, or features.

${OUTPUT_STRUCTURE}

---

## Company/Product Information

${companyText}

---

Generate the full growth strategy document in Markdown. Start with "# Growth Strategy: [Company Name]".`;
}

function formatStructuredInput(obj) {
  const parts = [];
  if (obj.name) parts.push(`**Name:** ${obj.name}`);
  if (obj.product) parts.push(`**Product:** ${obj.product}`);
  if (Array.isArray(obj.features) && obj.features.length) {
    parts.push(`**Features:**`);
    obj.features.forEach((f) => {
      const name = typeof f === 'string' ? f : f.name;
      const purpose = typeof f === 'object' && f ? f.purpose || '' : '';
      const diff = typeof f === 'object' && f && f.differentiator ? ` (${f.differentiator})` : '';
      parts.push(`  - ${name}: ${purpose}${diff}`);
    });
  }
  if (obj.targetMarket) parts.push(`**Target Market:** ${obj.targetMarket}`);
  if (obj.competitors?.length) parts.push(`**Competitors:** ${Array.isArray(obj.competitors) ? obj.competitors.join(', ') : obj.competitors}`);
  if (obj.currentMetrics) parts.push(`**Current Metrics:** ${JSON.stringify(obj.currentMetrics)}`);
  if (obj.monetization) parts.push(`**Monetization:** ${obj.monetization}`);
  if (obj.stage) parts.push(`**Stage:** ${obj.stage}`);
  if (obj.currentChannels?.length) parts.push(`**Current Channels:** ${Array.isArray(obj.currentChannels) ? obj.currentChannels.join(', ') : obj.currentChannels}`);
  if (obj.uniqueConstraints) parts.push(`**Constraints:** ${obj.uniqueConstraints}`);
  if (obj.notes) parts.push(`**Notes:** ${obj.notes}`);
  return parts.join('\n');
}

export function getSystemPrompt() {
  return FRAMEWORK;
}
