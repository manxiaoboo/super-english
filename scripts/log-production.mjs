import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { upsertMarkdownTableRow } from './lib/markdown-table.mjs';
import { todayIso } from './lib/learning-config.mjs';

const args = parseArgs(process.argv.slice(2));
const payload = loadPayload(args);
const date = payload.date ?? args.date ?? todayIso();
const userText = payload.userText ?? args.userText;
const issues = normalizeIssues(payload.issues);

if (!userText) {
  fail('Missing userText. Use --file payload.json or --json "{...}".');
}

if (issues.length === 0) {
  fail('Missing issues. Provide at least one diagnostic issue.');
}

const logEntry = buildLogEntry(date, payload, issues);
const diagnosticsMarkdown = existsSync('learning/diagnostics.md')
  ? readFileSync('learning/diagnostics.md', 'utf8')
  : defaultDiagnosticsMarkdown();

let nextDiagnostics = diagnosticsMarkdown;
for (const issue of issues) {
  nextDiagnostics = updateDiagnosticTable(nextDiagnostics, date, issue);
}

if (args['dry-run']) {
  console.log(JSON.stringify({ date, issues: issues.map((issue) => issue.category), dryRun: true }, null, 2));
  process.exit(0);
}

writeFileSync('learning/diagnostics.md', nextDiagnostics, 'utf8');
appendProductionLog(date, logEntry);

console.log(JSON.stringify({ date, loggedIssues: issues.length, categories: issues.map((issue) => issue.category) }, null, 2));

function buildLogEntry(logDate, payloadData, issueList) {
  const lines = [
    `### ${payloadData.sourceType ?? 'production'}: ${payloadData.sourceId ?? 'free-practice'}`,
    '',
    `- 时间：${logDate}`,
    `- 场景：${payloadData.context ?? 'review-or-production'}`,
    `- 评分：${payloadData.result ?? 'unspecified'}`,
    '',
    '#### 用户原句',
    '',
    payloadData.userText,
    ''
  ];

  if (payloadData.correctedText) {
    lines.push('#### 建议表达', '', payloadData.correctedText, '');
  }

  lines.push('#### 诊断问题', '');
  for (const issue of issueList) {
    lines.push(`- ${issue.category}：${issue.note}`);
    if (issue.suggestion) {
      lines.push(`  建议：${issue.suggestion}`);
    }
  }

  if (payloadData.generalAdvice) {
    lines.push('', '#### 总体建议', '', payloadData.generalAdvice);
  }

  return lines.join('\n');
}

function updateDiagnosticTable(markdown, dateText, issue) {
  const row = findDiagnosticRow(markdown, issue.category);
  const nextCount = row ? Number(row.Count || 0) + 1 : 1;
  const nextRow = {
    Category: issue.category,
    Count: String(nextCount),
    'Last Seen': dateText,
    'Typical Problems': issue.note,
    Suggestion: issue.suggestion ?? ''
  };
  return upsertMarkdownTableRow(markdown, 'Category', issue.category, nextRow).markdown;
}

function findDiagnosticRow(markdown, category) {
  const lines = markdown.split(/\r?\n/);
  const tableStart = lines.findIndex((line) => line.trim().startsWith('| Category |'));
  if (tableStart === -1) {
    return null;
  }

  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith('|')) {
      break;
    }
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (cells[0] === category) {
      return {
        Category: cells[0],
        Count: cells[1],
        'Last Seen': cells[2],
        'Typical Problems': cells[3],
        Suggestion: cells[4]
      };
    }
  }

  return null;
}

function appendProductionLog(logDate, entry) {
  const file = 'learning/production-log.md';
  let markdown = existsSync(file) ? readFileSync(file, 'utf8') : '# Production Log\n';

  if (markdown.includes(`## ${logDate}`)) {
    markdown = markdown.replace(new RegExp(`(## ${logDate}\\n)`), `$1\n${entry}\n\n`);
  } else {
    markdown = `${markdown.trim()}\n\n## ${logDate}\n\n${entry}\n`;
  }

  writeFileSync(file, markdown, 'utf8');
}

function normalizeIssues(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((issue) => issue && issue.category && issue.note)
    .map((issue) => ({
      category: issue.category,
      note: issue.note,
      suggestion: issue.suggestion ?? ''
    }));
}

function defaultDiagnosticsMarkdown() {
  return '# Diagnostics Summary\n\n| Category | Count | Last Seen | Typical Problems | Suggestion |\n|---|---:|---|---|---|\n';
}

function loadPayload(options) {
  if (options.file) {
    return JSON.parse(readFileSync(options.file, 'utf8'));
  }
  if (options.json) {
    return JSON.parse(options.json);
  }
  return options;
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