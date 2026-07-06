import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { itemTypes, slugify, todayIso } from './lib/learning-config.mjs';
import { parseMarkdownTable } from './lib/markdown-table.mjs';

const args = parseArgs(process.argv.slice(2));
const date = args.date ?? todayIso();
const limit = Number(args.limit ?? 20);
const requestedTypes = args.type ? [args.type] : Object.keys(itemTypes);
const format = args.format ?? 'markdown';

const dueItems = [];

for (const type of requestedTypes) {
  const config = itemTypes[type];
  if (!config || !existsSync(config.indexFile)) {
    continue;
  }

  const table = parseMarkdownTable(readFileSync(config.indexFile, 'utf8'));
  for (const { row } of table.rows) {
    const nextReview = row['Next Review'];
    if (!nextReview || nextReview > date) {
      continue;
    }

    const id = row[config.keyColumn];
    dueItems.push({
      type,
      id,
      nextReview,
      reviewCount: Number(row['Review Count'] ?? 0),
      lastResult: row['Last Result'] ?? '',
      summary: row.Meaning ?? row.Intention ?? row.Sentence ?? '',
      cues: readCues(config, id)
    });
  }
}

const selected = dueItems.slice(0, limit);

if (format === 'json') {
  console.log(JSON.stringify({ date, count: selected.length, items: selected }, null, 2));
} else {
  printMarkdown(date, selected, dueItems.length);
}

function readCues(config, id) {
  const file = join(config.detailDir, `${slugify(id)}.md`);
  if (!existsSync(file)) {
    return '';
  }

  const markdown = readFileSync(file, 'utf8');
  const cues = [];
  for (const section of config.cueSections) {
    const content = extractSection(markdown, section) || extractMetadataLine(markdown, section);
    if (content) {
      cues.push(`### ${section}\n${content}`);
    }
  }

  return cues.join('\n\n');
}

function extractSection(markdown, section) {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|\\r?\\n)##+ ${escaped}\\r?\\n([\\s\\S]*?)(?=\\r?\\n##+ |$)`, 'i');
  const match = markdown.match(pattern);
  if (!match) {
    return '';
  }

  return match[1].trim().split(/\r?\n/).slice(0, 12).join('\n');
}

function extractMetadataLine(markdown, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|\\r?\\n)- ${escaped}：(.+)(?:\\r?\\n|$)`, 'i');
  const match = markdown.match(pattern);
  return match ? match[1].trim() : '';
}

function printMarkdown(date, items, totalCount) {
  console.log(`# Due Learning Items (${date})`);
  console.log('');
  console.log(`Count: ${items.length}${totalCount > items.length ? ` of ${totalCount}` : ''}`);

  if (items.length === 0) {
    console.log('');
    console.log('No items are due today.');
    return;
  }

  for (const item of items) {
    console.log('');
    console.log(`## ${item.type}: ${item.id}`);
    console.log(`- next review: ${item.nextReview}`);
    console.log(`- review count: ${item.reviewCount}`);
    console.log(`- last result: ${item.lastResult}`);
    if (item.summary) {
      console.log(`- summary: ${item.summary}`);
    }
    if (item.cues) {
      console.log('');
      console.log(item.cues);
    }
  }
}

function parseArgs(rawArgs) {
  const result = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith('--')) {
      continue;
    }
    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }
  return result;
}