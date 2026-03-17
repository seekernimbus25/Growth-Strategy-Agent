---
name: growth-strategy
description: Creates detailed, personalized growth strategies for any company, product, or feature using a structured growth strategy framework. Use when the user asks for a growth strategy, growth plan, or growth roadmap for a company.
---

# Growth Strategy Agent

Generate a **detailed, personalized** growth strategy for any company, product, or feature. Follow the growth strategy framework. Output must never be generic.

## Triggers

- "Create a growth strategy for [company/product]"
- "Build a growth plan for [X]"
- "Growth strategy for [company]"
- "Help me with growth for [product]"

## Workflow

### 1. Gather Company Info

Accept free text or structured input. Extract or ask for:
- Company/product name
- Product description (what it does, how it works)
- Features (name, purpose, differentiator)
- Target market and personas
- Competitors and how they differ
- Current metrics (users, retention, revenue)
- Monetization model and pricing
- Stage (early, growth, scale)
- Current channels (what works, what does not)
- Unique constraints (budget, regulation, geography, tech)

### 2. Discovery (If Info Is Thin)

Ask 3–5 clarifying questions before generating:
- Which feature drives stickiness? Which drives acquisition?
- Who is your highest-value user segment?
- What is the main alternative users choose? Why switch to you?
- Where does retention flatten? Cohort differences?
- Which acquisition channel works best? What have you abandoned?
- Any constraints: budget, team size, regulation?
- What do competitors do well? Where are they weak?

### 3. Verify Nuances

Ensure features, constraints, and differentiators are captured. Avoid generic assumptions.

### 4. Generate Strategy

Walk through the 8-phase framework. See [framework.md](framework.md) and [output-template.md](output-template.md). Include: key metrics to track (with recommended dashboard views); experiment prioritization (ICE: Impact, Confidence, Ease); viral/referral lens and channel tactics where relevant; optional "Suggested first 6 weeks" or 6-week cadence if the user wants execution focus.

**Anti-generic rules:**
- Forbidden: "Consider focusing on retention", "Leverage viral loops", "Improve activation" (without naming *what* and *how* for this product)
- Required: Name company, product, and features in every section
- Required: Tie each recommendation to a specific metric, flow, or feature
- Required: Call out competitor-specific tactics when relevant
- Required: Address constraints explicitly

### 5. Formatting Rules

- Never use em-dashes (—). Use hyphens (-), colons (:), or commas (,) instead.
- Tables: No cell may be empty. Every header and every data cell must contain content. The first column header must name the row dimension (e.g., "Parameter", "Experiment", "Action"); every first-column body cell must have a value. Never use `| | Col2 |` or leave any cell blank.

### 6. Export Options

If user requests DOC/Word/Google Docs, save as `.docx`:
- Run `node generate.js` from this repo's root with `-f docx` and the company info, or
- Create the strategy in chat and offer to save as DOCX using the script

## Reference

- Framework: [framework.md](framework.md)
- Output structure: [output-template.md](output-template.md)
- Full guide: [MASTER_GUIDE.md](../../MASTER_GUIDE.md) (in this repo)
