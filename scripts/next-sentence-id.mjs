import { existsSync, readdirSync } from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const date = args.date ?? new Date().toISOString().slice(0, 10);
const dir = 'learning/sentences';
const files = existsSync(dir) ? readdirSync(dir) : [];
const numbers = files
  .map((file) => file.match(new RegExp(`^${date}-(\\d{3})\\.md$`)))
  .filter(Boolean)
  .map((match) => Number(match[1]));
const next = String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, '0');

console.log(`${date}-${next}`);

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