import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { addDays, itemTypes, slugify, todayIso } from './lib/learning-config.mjs';
import { upsertMarkdownTableRow } from './lib/markdown-table.mjs';

const args = parseArgs(process.argv.slice(2));
const payload = loadPayload(args);
const type = payload.type ?? args.type;
const id = payload.id ?? args.id;

if (!type || !id) {
  fail('Usage: npm run add-item -- --json "{...}" or --file item.json. Required fields: type, id.');
}

const config = itemTypes[type];
if (!config) {
  fail(`Unknown type: ${type}`);
}

const date = payload.learnedAt ?? args.date ?? todayIso();
const nextReview = payload.nextReview ?? addDays(date, Number(payload.reviewInDays ?? 1));
const status = payload.status ?? 'new';
const reviewCount = String(payload.reviewCount ?? 0);
const lastResult = payload.lastResult ?? 'learned';
const detailFile = join(config.detailDir, `${slugify(id)}.md`);
const detailMarkdown = payload.markdown ?? buildDetailMarkdown(type, id, payload, date, nextReview, status, reviewCount, lastResult);
const indexRow = buildIndexRow(type, id, payload, date, nextReview, status, reviewCount, lastResult);

const indexMarkdown = existsSync(config.indexFile) ? readFileSync(config.indexFile, 'utf8') : defaultIndexMarkdown(type);
const upsertResult = upsertMarkdownTableRow(indexMarkdown, config.keyColumn, id, indexRow);

if (args['dry-run']) {
  console.log(JSON.stringify({
    type,
    id,
    action: upsertResult.action,
    indexFile: config.indexFile,
    detailFile,
    nextReview,
    dryRun: true
  }, null, 2));
  process.exit(0);
}

mkdirSync(config.detailDir, { recursive: true });
writeFileSync(config.indexFile, upsertResult.markdown, 'utf8');
writeFileSync(detailFile, detailMarkdown.endsWith('\n') ? detailMarkdown : `${detailMarkdown}\n`, 'utf8');
appendLearningLog(date, type, id, nextReview, upsertResult.action);

console.log(JSON.stringify({ type, id, action: upsertResult.action, indexFile: config.indexFile, detailFile, nextReview }, null, 2));

function buildIndexRow(typeName, itemId, data, learnedAt, nextReviewDate, itemStatus, count, result) {
  if (typeName === 'word') {
    return {
      Word: itemId,
      Meaning: data.meaning ?? data.coreMeaning ?? '',
      Status: itemStatus,
      'Learned At': learnedAt,
      'Next Review': nextReviewDate,
      'Review Count': count,
      'Last Result': result
    };
  }
  if (typeName === 'phrase') {
    return {
      Phrase: itemId,
      Meaning: data.meaning ?? '',
      Status: itemStatus,
      'Learned At': learnedAt,
      'Next Review': nextReviewDate,
      'Review Count': count,
      'Last Result': result
    };
  }
  if (typeName === 'grammar') {
    return {
      Grammar: itemId,
      Intention: data.intention ?? data.meaning ?? '',
      Status: itemStatus,
      'Learned At': learnedAt,
      'Next Review': nextReviewDate,
      'Review Count': count,
      'Last Result': result
    };
  }
  return {
    ID: itemId,
    Sentence: data.sentence ?? data.originalSentence ?? '',
    'Learned At': learnedAt,
    'Next Review': nextReviewDate,
    'Review Count': count,
    'Last Result': result
  };
}

function buildDetailMarkdown(typeName, itemId, data, learnedAt, nextReviewDate, itemStatus, count, result) {
  if (typeName === 'word') {
    return `# ${itemId}

- 发音：${data.pronunciation ?? ''}
- 词性：${data.partOfSpeech ?? ''}
- 核心意思：${data.coreMeaning ?? data.meaning ?? ''}
- 核心动作/画面：${data.coreImage ?? ''}
- 中文释义：${data.chineseMeaning ?? ''}
- 学习日期：${learnedAt}
- 熟练度：${itemStatus}
- 下次复习：${nextReviewDate}
- 复习次数：${count}
- 最近结果：${result}

## 荒诞寓言

${data.fable ?? ''}

## 寓意

${data.moral ?? ''}

## 记忆钩子

${data.memoryHook ?? ''}

## 英文锚定句

${data.anchorSentence ?? ''}

## 常见搭配

${formatList(data.collocations)}

## 个人化例句

${data.personalExample ?? ''}

## 易混词/注意点

${data.notes ?? ''}

## 主动回忆测试

${formatNumberedList(data.recallQuestions)}

## 复习记录

- ${learnedAt}：首次学习。下次复习：${nextReviewDate}。
`;
  }

  if (typeName === 'sentence') {
    return `# Sentence Study ${itemId}

- 学习日期：${learnedAt}
- 熟练度：${itemStatus}
- 下次复习：${nextReviewDate}
- 复习次数：${count}
- 最近结果：${result}

## Original Sentence

${data.sentence ?? data.originalSentence ?? ''}

## Unknown Items

### Words

${formatList(data.words)}

### Phrases

${formatList(data.phrases)}

### Grammar

${formatList(data.grammar)}

## Sentence Breakdown

${data.breakdown ?? ''}

## Translation

${data.translation ?? ''}

## Learned Items

${formatList(data.learnedItems)}

## Review Questions

${formatNumberedList(data.reviewQuestions)}

## 复习记录

- ${learnedAt}：首次学习。下次复习：${nextReviewDate}。
`;
  }

  return `# ${itemId}

- 学习日期：${learnedAt}
- 熟练度：${itemStatus}
- 下次复习：${nextReviewDate}
- 复习次数：${count}
- 最近结果：${result}

## Meaning

${data.meaning ?? data.intention ?? ''}

## Usage Context

${data.usageContext ?? ''}

## Anchor Sentence

${data.anchorSentence ?? ''}

## Review Questions

${formatNumberedList(data.reviewQuestions)}

## 复习记录

- ${learnedAt}：首次学习。下次复习：${nextReviewDate}。
`;
}

function defaultIndexMarkdown(typeName) {
  const defaults = {
    word: '# Vocabulary Index\n\n| Word | Meaning | Status | Learned At | Next Review | Review Count | Last Result |\n|---|---|---|---|---|---:|---|\n',
    phrase: '# Phrase Index\n\n| Phrase | Meaning | Status | Learned At | Next Review | Review Count | Last Result |\n|---|---|---|---|---|---:|---|\n',
    grammar: '# Grammar Index\n\n| Grammar | Intention | Status | Learned At | Next Review | Review Count | Last Result |\n|---|---|---|---|---|---:|---|\n',
    sentence: '# Sentence Index\n\n| ID | Sentence | Learned At | Next Review | Review Count | Last Result |\n|---|---|---|---|---:|---|\n'
  };
  return defaults[typeName];
}

function appendLearningLog(learnedAt, itemType, itemId, nextReviewDate, action) {
  const file = 'learning/review-log.md';
  const line = `- ${action === 'created' ? 'learned' : 'updated'} ${itemType} \`${itemId}\`; next review: ${nextReviewDate}`;
  let markdown = existsSync(file) ? readFileSync(file, 'utf8') : '# Review Log\n';

  if (markdown.includes(`## ${learnedAt}`)) {
    const headingPattern = new RegExp(`(## ${escapeRegExp(learnedAt)}\\r?\\n(?:\\r?\\n)?)`);
    markdown = markdown.replace(headingPattern, `$1${line}\n`);
  } else {
    markdown = `${markdown.trim()}\n\n## ${learnedAt}\n\n${line}\n`;
  }

  writeFileSync(file, markdown, 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatList(values) {
  if (Array.isArray(values)) {
    return values.length > 0 ? values.map((value) => `- ${value}`).join('\n') : '';
  }
  return values ?? '';
}

function formatNumberedList(values) {
  if (Array.isArray(values)) {
    return values.length > 0 ? values.map((value, index) => `${index + 1}. ${value}`).join('\n') : '';
  }
  return values ?? '';
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