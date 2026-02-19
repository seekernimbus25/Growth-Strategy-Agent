#!/usr/bin/env node
/**
 * List available Anthropic models (run: node list-models.js)
 */
try {
  const { config } = await import('dotenv');
  config();
} catch (_) {}

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error('Set ANTHROPIC_API_KEY in .env');
  process.exit(1);
}

const res = await fetch('https://api.anthropic.com/v1/models', {
  headers: {
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
  },
});

if (!res.ok) {
  console.error('Error:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log('Available Anthropic models:\n');
data.data?.forEach((m) => console.log('  ', m.id));
console.log('\nSet ANTHROPIC_MODEL in .env to use a specific model.');
