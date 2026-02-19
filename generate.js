#!/usr/bin/env node

/**
 * Growth Strategy Agent - CLI
 * Generates personalized growth strategies using the Reforge framework
 *
 * Usage:
 *   node generate.js "Free text company description"
 *   node generate.js --input company.json
 *   node generate.js --input company.json -o strategy.md
 *   node generate.js --input company.json -o strategy.docx
 *   node generate.js "description" -f docx -o strategy.docx
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { buildPrompt, getSystemPrompt } from './framework.js';

// Load dotenv if available
try {
  const { config } = await import('dotenv');
  config();
} catch (_) {}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { freeText: null, inputFile: null, output: null, format: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      result.inputFile = args[++i];
    } else if (args[i] === '-o' || args[i] === '--output') {
      result.output = args[++i];
    } else if (args[i] === '-f' || args[i] === '--format') {
      result.format = args[++i];
    } else if (!args[i].startsWith('-')) {
      result.freeText = args.slice(i).join(' ');
      break;
    }
  }

  // Infer format from output extension
  if (result.output && extname(result.output).toLowerCase() === '.docx') {
    result.format = 'docx';
  }
  return result;
}

function loadCompanyInfo(inputFile, freeText) {
  if (inputFile) {
    const path = resolve(inputFile);
    if (!existsSync(path)) {
      console.error(`Input file not found: ${path}`);
      process.exit(1);
    }
    const content = readFileSync(path, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (_) {
      return content; // treat as free text
    }
  }
  return freeText || null;
}

async function callOpenAI(prompt) {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: getSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 16000,
  });
  return completion.choices[0]?.message?.content || '';
}

async function callAnthropic(prompt) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: getSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });
  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

async function generateStrategy(prompt) {
  if (OPENAI_API_KEY) return callOpenAI(prompt);
  if (ANTHROPIC_API_KEY) return callAnthropic(prompt);
  return null;
}

async function convertToDocx(markdown) {
  const { convertMarkdownToDocx } = await import('@mohtasham/md-to-docx');
  const blob = await convertMarkdownToDocx(markdown);
  const buf = Buffer.from(await blob.arrayBuffer());
  return buf;
}

async function main() {
  const { freeText, inputFile, output, format } = parseArgs();
  const companyInfo = loadCompanyInfo(inputFile, freeText);

  if (!companyInfo) {
    console.error('Provide company info as free text or --input <file>');
    console.error('Example: node generate.js "SaaS for e-commerce, freemium, early stage"');
    console.error('Example: node generate.js --input company.json -o strategy.md');
    process.exit(1);
  }

  const prompt = buildPrompt(companyInfo);

  if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
    const fallbackPath = output || 'growth-strategy-prompt.md';
    writeFileSync(resolve(fallbackPath), `# Growth Strategy Prompt\n\nPaste the below into Cursor or any LLM:\n\n---\n\n## System\n\n${getSystemPrompt()}\n\n## User\n\n${prompt}\n`, 'utf-8');
    console.log(`No API key found. Wrote prompt to ${fallbackPath}`);
    return;
  }

  console.log('Generating growth strategy...');
  const markdown = await generateStrategy(prompt);

  if (!markdown) {
    console.error('Failed to generate strategy');
    process.exit(1);
  }

  const outPath = output ? resolve(output) : resolve('growth-strategy.md');
  const wantDocx = format === 'docx' || extname(outPath).toLowerCase() === '.docx';

  if (wantDocx) {
    const docxBuffer = await convertToDocx(markdown);
    writeFileSync(outPath, docxBuffer);
    console.log(`Saved DOCX to ${outPath} (editable in Word/Google Docs)`);
  } else {
    writeFileSync(outPath, markdown, 'utf-8');
    console.log(`Saved Markdown to ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
