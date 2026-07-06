import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { addDays, itemTypes, slugify, todayIso } from './lib/learning-config.mjs';
import { formatMarkdownRow, parseMarkdownTable } from './lib/markdown-table.mjs';

const args = parseArgs(process.argv.slice(2));
const type = args.type;
const id = args.id;
const result = args.result;
const date = args.date ?? todayIso();

if (!type || !id || !result) {
  fail('Usage: npm run update-review -- --type word --id fable --result good [--date 2026-07-06] [--note "..."]');
}

const config = itemTypes[type];
if (!config) {
  fail(`Unknown type: ${type}`);
}
if (!existsSync(config.indexFile)) {
  fail(`Missing index file: ${config.indexFile}`);
}

const nextReview = calculateNextReview(date, result, Number(args.reviewCount ?? 0));
const indexMarkdown = readFileSync(config.indexFile, 'utf8');
const table = parseMarkdownTable(indexMarkdown);
const match = table.rows.find(({ row }) => row[config.keyColumn] === id);

if (!match) {
  fail(`Item not found in ${config.indexFile}: ${id}`);
}

const currentReviewCount = Number(match.row['Review Count'] ?? 0);
const nextReviewCount = currentReviewCount + 1;
match.row.Status = statusFor(result, nextReviewCount);
match.row['Next Review'] = nextReview;
match.row['Review Count'] = String(nextReviewCount);
match.row['Last Result'] = result;
table.lines[match.lineIndex] = formatMarkdownRow(table.headers, match.row);

if (args['dry-run']) {
  console.log(JSON.stringify({ type, id, result, nextReview, reviewCount: nextReviewCount, dryRun: true }, null, 2));
  process.exit(0);
}

writeFileSync(config.indexFile, table.lines.join('\n'), 'utf8');

const detailFile = join(config.detailDir, `${slugify(id)}.md`);
appendReviewEntry(detailFile, date, result, nextReview, args.note ?? '');
appendReviewLog(date, type, id, result, nextReview);

console.log(JSON.stringify({ type, id, result, nextReview, reviewCount: nextReviewCount }, null, 2));

function calculateNextReview(dateText, reviewResult, reviewCount) {
  const intervals = { forgot: 1, hard: 3, good: 7, easy: reviewCount >= 5 ? 30 : 14 };
  const days = intervals[reviewResult];
  if (!days) {
    fail(`Unknown result: ${reviewResult}. Use forgot, hard, good, or easy.`);
  }
  return addDays(dateText, days);
}

function statusFor(reviewResult, reviewCount) {
  if (reviewResult === 'forgot') {
    return 'learning';
  }
  if (reviewResult === 'easy' && reviewCount >= 5) {
    return 'mature';
  }
  return 'reviewing';
}

function appendReviewEntry(file, reviewDate, reviewResult, nextDate, note) {
  if (!existsSync(file)) {
    return;
  }
  let markdown = readFileSync(file, 'utf8');
  const entry = `- ${reviewDate}：${reviewResult}${note ? `，${note}` : ''}。下次复习：${nextDate}。`;
  if (markdown.includes('## 复习记录')) {
    markdown = markdown.replace(/## 复习记录\s*\n/, `## 复习记录\n\n${entry}\n`);
  } else {
    markdown = `${markdown.trim()}\n\n## 复习记录\n\n${entry}\n`;
  }
  writeFileSync(file, markdown, 'utf8');
}

function appendReviewLog(reviewDate, itemType, itemId, reviewResult, nextDate) {
  const file = 'learning/review-log.md';
  const line = `- reviewed ${itemType} \`${itemId}\`: ${reviewResult}; next review: ${nextDate}`;
  let markdown = existsSync(file) ? readFileSync(file, 'utf8') : '# Review Log\n';

  if (markdown.includes(`## ${reviewDate}`)) {
    markdown = markdown.replace(new RegExp(`(## ${reviewDate}\\n)`), `$1\n${line}\n`);
  } else {
    markdown = `${markdown.trim()}\n\n## ${reviewDate}\n\n${line}\n`;
  }

  writeFileSync(file, markdown, 'utf8');
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

function fail(message) {
  console.error(message);
  process.exit(1);
}