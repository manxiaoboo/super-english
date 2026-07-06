export function parseMarkdownTable(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim().startsWith('|') && line.includes('|---'));
  if (headerIndex <= 0) {
    return { headers: [], rows: [], lines, headerLineIndex: -1 };
  }

  const headerLineIndex = headerIndex - 1;
  const headers = splitRow(lines[headerLineIndex]);
  const rows = [];

  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith('|')) {
      break;
    }

    const cells = splitRow(line);
    if (cells.length !== headers.length) {
      continue;
    }

    const row = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]]));
    rows.push({ row, lineIndex: index });
  }

  return { headers, rows, lines, headerLineIndex };
}

export function formatMarkdownRow(headers, row) {
  return `| ${headers.map((header) => row[header] ?? '').join(' | ')} |`;
}

export function upsertMarkdownTableRow(markdown, keyColumn, keyValue, nextRow) {
  const table = parseMarkdownTable(markdown);
  if (table.headers.length === 0) {
    throw new Error('Markdown table not found.');
  }

  const existing = table.rows.find(({ row }) => row[keyColumn] === keyValue);
  const normalizedRow = Object.fromEntries(table.headers.map((header) => [header, nextRow[header] ?? '']));

  if (existing) {
    table.lines[existing.lineIndex] = formatMarkdownRow(table.headers, normalizedRow);
    return { markdown: table.lines.join('\n'), action: 'updated' };
  }

  const insertAt = table.rows.length > 0 ? table.rows.at(-1).lineIndex + 1 : table.headerLineIndex + 2;
  table.lines.splice(insertAt, 0, formatMarkdownRow(table.headers, normalizedRow));
  return { markdown: table.lines.join('\n'), action: 'created' };
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}