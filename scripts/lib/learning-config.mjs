export const itemTypes = {
  word: {
    indexFile: 'learning/vocabulary.md',
    detailDir: 'learning/words',
    keyColumn: 'Word',
    cueSections: ['核心动作/画面', '荒诞寓言', '记忆钩子', '英文锚定句', '主动回忆测试']
  },
  phrase: {
    indexFile: 'learning/phrases.md',
    detailDir: 'learning/phrases',
    keyColumn: 'Phrase',
    cueSections: ['Meaning', 'Usage Context', 'Original Sentence Chunk', 'Anchor Sentence', 'Review Questions']
  },
  chunk: {
    indexFile: 'learning/chunks.md',
    detailDir: 'learning/chunks',
    keyColumn: 'Chunk',
    cueSections: ['Chinese Intention', 'Natural Chunk', 'Sentence Patterns', 'Real-Life Examples', 'Production Prompts']
  },
  grammar: {
    indexFile: 'learning/grammar.md',
    detailDir: 'learning/grammar',
    keyColumn: 'Grammar',
    cueSections: ['Expression Intention', 'Core Structure', 'Minimal Contrast', 'Original Sentence Role', 'Review Questions']
  },
  sentence: {
    indexFile: 'learning/sentences.md',
    detailDir: 'learning/sentences',
    keyColumn: 'ID',
    cueSections: ['Original Sentence', 'Sentence Breakdown', 'Review Questions']
  }
};

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}