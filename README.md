# Growth Strategy Agent

Generate **personalized growth strategies** for any company, product, or feature using a structured full-funnel growth framework.

## Setup

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env
```

## Usage

### Free text input

```bash
node generate.js "SaaS tool for small e-commerce stores, freemium, early stage"
```

### Structured JSON input

Create `company.json`:

```json
{
  "name": "Acme SaaS",
  "product": "Inventory management for SMB retailers",
  "features": [
    { "name": "Sync", "purpose": "Sync across channels", "differentiator": "Real-time, no lag" },
    { "name": "Reports", "purpose": "Analytics", "differentiator": "Custom dashboards" }
  ],
  "targetMarket": "US SMB retailers, 10-100 SKUs",
  "competitors": ["CompetitorA (enterprise-focused)", "CompetitorB (expensive)"],
  "currentMetrics": { "users": "2k", "retention": "~40%", "revenue": "M2" },
  "monetization": "Freemium, $29/mo starter, $99/mo pro",
  "stage": "early",
  "currentChannels": ["SEO, content marketing; paid not yet"],
  "uniqueConstraints": "Small team, bootstrapped",
  "notes": "Focus on product-led growth"
}
```

Run:

```bash
node generate.js --input company.json
```

### Output options

- **Markdown (default):** `node generate.js --input company.json -o strategy.md`
- **DOCX (editable in Word/Google Docs):** `node generate.js --input company.json -o strategy.docx` or `-f docx`

```bash
node generate.js --input company.json -o growth-strategy.docx
node generate.js "description" -f docx -o strategy.docx
```

### No API key

If neither `OPENAI_API_KEY` nor `ANTHROPIC_API_KEY` is set, the script writes `growth-strategy-prompt.md` with the formatted prompt for you to paste into Cursor or any LLM.

## Output format

The strategy document includes:

1. Executive summary
2. Company & product context
3. Retention strategy
4. Engagement & habit loops
5. Acquisition strategy
6. Monetization strategy
7. Growth model
8. User psychology
9. Experiments
10. Defensibility
11. Prioritized action plan

## Cursor integration

The `.cursor/skills/growth-strategy/` skill lets you ask in chat:

- "Create a growth strategy for [company]"
- "Build a growth plan for [product]"

The agent follows the same framework and can save output as DOCX when requested.
