#!/usr/bin/env node
/**
 * Fix DOCX tables: fill empty first-column cells with relevant values.
 * Usage: node fix-docx-tables.js <input.docx> [output.docx]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import mammoth from 'mammoth';
import HTMLtoDOCX from 'html-to-docx';

function getText(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function inferFirstColumnValue(headerFirstCol, secondColText, rowIndex) {
  const h = (headerFirstCol || '').toLowerCase();
  const s = (secondColText || '').toLowerCase();
  const dimLabels = ['Product', 'Features', 'Target Market', 'Stage', 'Monetization', 'Market'];
  const compLabels = ['Competitor 1', 'Competitor 2', 'Competitor 3', 'Competitor 4', 'Competitor 5', 'Competitor 6'];
  const expLabels = ['MVT 1', 'MVT 2', 'MVT 3', 'MVT 4', 'MVT 5'];
  const actionLabels = ['Action 1', 'Action 2', 'Action 3', 'Action 4', 'Action 5', 'Action 6', 'Action 7', 'Action 8', 'Action 9', 'Action 10'];

  if (h.includes('dimension') || h.includes('parameter') || h.includes('aspect')) {
    return dimLabels[rowIndex] || `Item ${rowIndex + 1}`;
  }
  if (h.includes('competitor') || h.includes('competition')) {
    if (s.includes('aws') || s.includes('sagemaker') || s.includes('verbose') || s.includes('cold start')) return 'AWS SageMaker';
    if (s.includes('replicate') || s.includes('developer') || s.includes('hobbyist')) return 'Replicate';
    if (s.includes('modal') || s.includes('serverless')) return 'Modal';
    if (s.includes('baseten') || s.includes('api-first') || s.includes('closed orchestration')) return 'Baseten';
    if (s.includes('ray') || s.includes('anyscale') || s.includes('complex') || s.includes('steep learning')) return 'Anyscale / Ray';
    return compLabels[rowIndex] || `Competitor ${rowIndex + 1}`;
  }
  if (h.includes('mvt') || h.includes('experiment') || h.includes('hypothesis')) {
    return expLabels[rowIndex] || `MVT ${rowIndex + 1}`;
  }
  if (h.includes('action') || h.includes('step') || h.includes('initiative')) {
    return actionLabels[rowIndex] || `Action ${rowIndex + 1}`;
  }
  const short = secondColText.substring(0, 40).trim();
  if (short.length > 2) return short + (secondColText.length > 40 ? '...' : '');
  return `Item ${rowIndex + 1}`;
}

function fixEmptyFirstCells(html) {
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  return html.replace(tableRegex, (tableMatch) => {
    const fullTable = tableMatch;
    const theadMatch = /<thead>([\s\S]*?)<\/thead>/i.exec(fullTable);
    const tbodyMatch = /<tbody>([\s\S]*?)<\/tbody>/i.exec(fullTable);

    let headerFirstCol = '';
    if (theadMatch) {
      const firstTh = /<th[^>]*>([\s\S]*?)<\/th>/i.exec(theadMatch[1]);
      if (firstTh) headerFirstCol = getText(firstTh[1]);
    }

    const fillEmptyFirstCell = (cellTag, attrs, rowIndex, secondColText) => {
      const value = inferFirstColumnValue(headerFirstCol, secondColText, rowIndex);
      return `<${cellTag}${attrs}><p>${value}</p></${cellTag}>`;
    };

    let newTable = fullTable;

    if (tbodyMatch) {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows = [];
      let m;
      const tbodyContent = tbodyMatch[1];
      while ((m = rowRegex.exec(tbodyContent)) !== null) {
        rows.push(m[1]);
      }

      let newTbody = tbodyMatch[1];
      rows.forEach((rowContent, rowIndex) => {
        const cellRegex = /<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/gi;
        const cells = [];
        let cm;
        while ((cm = cellRegex.exec(rowContent)) !== null) {
          cells.push({ full: cm[0], tag: cm[0].startsWith('<th') ? 'th' : 'td', attrs: cm[1], content: cm[2] });
        }
        let secondColText = '';
        if (cells.length >= 2) secondColText = getText(cells[1].content);

        if (cells.length > 0 && !getText(cells[0].content)) {
          const newFirstCell = fillEmptyFirstCell(cells[0].tag, cells[0].attrs, rowIndex, secondColText);
          newTbody = newTbody.replace(rowContent, rowContent.replace(cells[0].full, newFirstCell));
        }
      });
      newTable = newTable.replace(tbodyMatch[0], '<tbody>' + newTbody + '</tbody>');
    }

    if (theadMatch) {
      const firstThMatch = /<th([^>]*)>([\s\S]*?)<\/th>/i.exec(theadMatch[1]);
      if (firstThMatch && !getText(firstThMatch[2])) {
        const defaultHeader = headerFirstCol || 'Item';
        const newFirstTh = `<th${firstThMatch[1]}><p><strong>${defaultHeader}</strong></p></th>`;
        const newThead = theadMatch[1].replace(firstThMatch[0], newFirstTh);
        newTable = newTable.replace(theadMatch[0], '<thead>' + newThead + '</thead>');
      }
    }

    return newTable;
  });
}

async function main() {
  const inputPath = resolve(process.argv[2] || 'Simplismart_strategy.docx');
  const outputPath = resolve(process.argv[3] || inputPath.replace(/\.docx?$/i, '_fixed.docx'));

  const buffer = readFileSync(inputPath);
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const fixedHtml = fixEmptyFirstCells(html);

  const docxBuffer = await HTMLtoDOCX(fixedHtml, null, { table: { row: { cantSplit: true } } });
  writeFileSync(outputPath, Buffer.from(docxBuffer));
  console.log(`Wrote ${outputPath}`);
}

main().catch(console.error);
