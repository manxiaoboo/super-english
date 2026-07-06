---
name: ai-sentence-prep
description: 'Use when: previewing English textbook sentences, cannot understand a sentence, sentence parsing, unknown words, unknown grammar, unknown phrases, pre-class preparation, extracting learning items, saving sentence study records for review.'
argument-hint: '<English sentence>'
user-invocable: true
---

# AI Sentence Prep

Use this skill when the user previews English textbook material and enters a sentence they cannot fully understand.

The goal is to turn one difficult sentence into concrete learning items: words, phrases, grammar patterns, and sentence understanding tasks. These items should be saved into the project and included in future reviews.

## Core Principle

Start from the sentence, not from an isolated grammar point.

The workflow is:

```text
textbook sentence -> sentence breakdown -> ask unknown points -> teach only the needed items -> save learning records -> add to review
```

Do not immediately give a long translation. First help the user see the sentence structure and identify what they do not know.

## When To Use

Use this skill when the user says or implies:

- I cannot understand this sentence
- help me preview this textbook sentence
- parse this sentence
- explain this sentence before class
- 这句话看不懂
- 预习教材句子
- 帮我拆句
- 这句话有哪些单词和语法需要学

## Learning Files

Use these project files:

- `learning/sentences.md`: sentence study index
- `learning/sentences/<date>-<number>.md`: one sentence study record
- `learning/vocabulary.md`: word index
- `learning/words/<word>.md`: word cards
- `learning/grammar.md`: grammar index
- `learning/grammar/<pattern>.md`: grammar cards
- `learning/phrases.md`: phrase index
- `learning/phrases/<phrase>.md`: phrase cards
- `learning/review-log.md`: chronological learning and review log

If a file or directory does not exist, create it.

## Token Saving Rules

Use Node scripts for mechanical project operations:

- Before saving a new sentence record, run `npm run next-sentence-id -- --date <YYYY-MM-DD>` to get the next sentence ID.
- Save extracted words, phrases, grammar, and sentence records with `npm run add-item -- --file <payload.json>`.
- Do not scan all sentence files manually to find the next ID.
- During later review, rely on `npm run due -- --date <YYYY-MM-DD>` from `ai-vocabulary-review` instead of reading all learning files.

The AI should spend tokens on sentence understanding, unknown-item diagnosis, explanation, and feedback. Scripts should handle indexing, scheduling, file lookup, and item persistence whenever possible.

## Interaction Flow

### 1. Receive The Sentence

Preserve the original sentence exactly.

If the user enters more than one sentence, ask whether to study them one by one or as a paragraph. For a first pass, prefer one sentence at a time.

### 2. Give A Quick Structural Preview

Show a short first analysis:

```text
原句：
...

可能的主干：
...

可能的修饰部分：
...

可能涉及：
- 单词：...
- 短语：...
- 语法：...
```

Keep this concise. The purpose is to help the user choose unknown points.

### 3. Ask What Is Unknown

Ask the user to mark unfamiliar items.

Use this format:

```text
你最不熟的是哪些？可以直接回复编号或内容。

单词：
1. ...
2. ...

短语：
3. ...
4. ...

语法/结构：
5. ...
6. ...

整句理解：
7. 我需要你完整拆解这句话
```

If the user says they do not know most of it, select the most important learning items yourself and explain why.

### 4. Teach Selected Items

For selected words, use the fable vocabulary method from `ai-fable-vocabulary`, but keep it shorter unless the user asks for a full card.

For selected phrases, explain:

- natural meaning
- literal meaning if useful
- usage context
- one anchor sentence
- one recall question

For selected grammar, explain:

- expression intention
- core structure
- minimal contrast
- role in the original sentence
- one transformation or production exercise

### 5. Explain The Whole Sentence

After teaching unknown points, return to the original sentence.

Use this structure:

```text
主干：
...

修饰/补充：
...

逐块理解：
...

自然翻译：
...

复述任务：
请你用自己的话说出这句话的意思。
```

If the user paraphrases the sentence or writes a new example sentence, diagnose sentence-production issues implicitly.

When there are clear issues in completeness, word order, grammar choice, collocation, or article/number usage, save them with:

```text
npm run log-production -- --file <payload.json>
```

This should build a long-term record of the user's sentence-production habits, not just one-off corrections.

### 6. Persist The Study Record

When the user asks to save, record, persist, or make this today's learning content, save the sentence and all selected learning items.

Use `npm run add-item -- --file <payload.json>` for each saved item rather than manually updating indexes.

Default metadata:

- learned at: today's date
- next review: tomorrow
- review count: `0`
- status: `new`
- source: `sentence-prep`

If the user did not explicitly ask to save but the session is clearly a textbook preview, ask whether to save the sentence and selected items.

## Sentence Record Format

Save sentence records as `learning/sentences/<date>-<number>.md`, for example `learning/sentences/2026-07-06-001.md`.

Generate `<date>-<number>` with:

```text
npm run next-sentence-id -- --date <YYYY-MM-DD>
```

Use this template:

```markdown
# Sentence Study <date>-<number>

- 学习日期：<date>
- 熟练度：new
- 下次复习：<date>
- 复习次数：0
- 最近结果：learned

## Original Sentence

<sentence>

## Unknown Items

### Words

- <word>

### Phrases

- <phrase>

### Grammar

- <grammar pattern>

## Sentence Breakdown

### Main Clause

...

### Modifiers / Extra Information

...

### Chunk Meaning

...

## Translation

...

## Learned Items

- word: `<word>`
- phrase: `<phrase>`
- grammar: `<pattern>`

## Review Questions

1. 这句话的主干是什么？
2. 某个修饰部分修饰谁或说明什么？
3. 某个语法结构表达什么意图？
4. 请翻译整句。
5. 请用其中一个新词或短语造句。

## 复习记录

- <date>：首次学习。下次复习：<date>。
```

## Index Schemas

Use `learning/sentences.md`:

```markdown
| ID | Sentence | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---:|---|
```

Use `learning/grammar.md`:

```markdown
| Grammar | Intention | Status | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---|---:|---|
```

Use `learning/phrases.md`:

```markdown
| Phrase | Meaning | Status | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---|---:|---|
```

## Review Integration

Saved sentence, grammar, phrase, and word records should all participate in spaced review.

During review, do not only ask for translation. Test structure recognition:

- identify the main clause
- identify modifiers
- explain grammar intention
- translate the sentence
- produce a new sentence using one learned item

## Quality Checklist

Before finalizing a sentence prep session, check that:

- the original sentence is preserved
- the main clause is identified when possible
- unknown words, phrases, and grammar are separated
- the user is asked what they do not know before deep teaching
- saved items have next review dates
- the sentence record links back to learned words, phrases, and grammar
- review questions test sentence understanding, not just translation