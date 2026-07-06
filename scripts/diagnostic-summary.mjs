import { existsSync, readFileSync } from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const limit = Number(args.limit ?? 5);
const file = 'learning/diagnostics.md';

if (!existsSync(file)) {
  console.log('# Diagnostics Summary\n\nNo diagnostics recorded yet.');
  process.exit(0);
}

const markdown = readFileSync(file, 'utf8');
const rows = parseRows(markdown)
  .sort((left, right) => Number(right.Count) - Number(left.Count))
  .slice(0, limit);

console.log('# Diagnostics Summary');
console.log('');

if (rows.length === 0) {
  console.log('No diagnostics recorded yet.');
  process.exit(0);
}

for (const row of rows) {
  console.log(`## ${row.Category}`);
  console.log(`- count: ${row.Count}`);
  console.log(`- last seen: ${row['Last Seen']}`);
  console.log(`- typical problem: ${row['Typical Problems']}`);
  if (row.Suggestion) {
    console.log(`- suggestion: ${row.Suggestion}`);
  }
  console.log('');
}

function parseRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().startsWith('| Category |'));
  if (start === -1) {
    return [];
  }

  const rows = [];
  for (let index = start + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith('|')) {
      break;
    }
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    rows.push({
      Category: cells[0],
      Count: cells[1],
      'Last Seen': cells[2],
      'Typical Problems': cells[3],
      Suggestion: cells[4]
    });
  }
  return rows;
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