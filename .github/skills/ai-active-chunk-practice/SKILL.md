---
name: ai-active-chunk-practice
description: 'Use when: 主动词块训练, active expression chunk practice, learn natural English chunks, save reusable sentence patterns, convert stiff sentences into chunks, drill chunk retrieval, improve active English production.'
argument-hint: '<count | source sentence | chunk | topic>'
user-invocable: true
---

# AI Active Chunk Practice

Use this skill when the user wants to actively learn, save, review, or drill natural English expression chunks.

The goal is to move useful English from passive recognition into active production. The unit of learning is not an isolated word; it is `chunk + sentence pattern + real situation`.

## Source Files

Use these files as the source of truth:

- `learning/chunks.md`: active chunk index and spaced review schedule
- `learning/chunks/<chunk>.md`: detailed active chunk card
- `learning/diagnostics.md`: recurring production weaknesses
- `learning/production-log.md`: the user's original stiff sentences and corrected versions
- `learning/vocabulary.md` and `learning/words/<word>.md`: vocabulary cards that may contain useful chunks

## Triggers

Use this skill when the user says things like:

- 主动词块训练
- 保存这个主动词块
- 帮我从这句话里提取词块
- 我想练表达块
- active chunk practice
- drill chunks
- turn this correction into reusable chunks
- help me stop translating word by word

## Core Workflow

Use this loop:

```text
source sentence or weak expression -> diagnose expression -> extract useful chunk -> bind to pattern and situation -> save automatically -> drill retrieval
```

Always distinguish:

- `Chinese intention`: what the user wanted to say
- `Avoid saying`: the stiff or Chinese-shaped expression
- `Natural chunk`: the reusable English expression
- `Sentence pattern`: the frame that helps retrieve the chunk
- `Real-life example`: a sentence the user might actually say

## Automatic Chunk Extraction

Whenever the user actively writes a complete English sentence, whether answering a review question, doing sentence practice, or attempting a translation, diagnose the sentence and automatically extract high-value active chunks from the correction.

Do not ask for confirmation before saving these active chunks. This is the user's default learning preference.

Save 1 to 3 chunks when they are genuinely reusable. Prefer chunks that directly correct the user's stiff expression or fill an active-production gap.

Good extraction targets:

- a corrected natural collocation: `run integration tests`
- a reusable technical process expression: `the build succeeds`
- a preposition pattern: `publish a package to Artifactory`
- a sentence frame: `Once ... is complete, ...`
- a correction for a known Chinese-shaped expression: `for testing` instead of `for your test`

Do not save:

- one-off full sentences that are too specific to reuse
- isolated words with no useful chunk
- tiny grammar corrections such as only changing `a` to `an`
- duplicate chunks unless the new card improves the pattern, example, or avoid-saying field

After saving, briefly tell the user which chunks were added.

## Saving A Chunk

When the user explicitly asks to save a chunk, or when a full-sentence correction exposes a high-value reusable expression, create a compact card.

Use this format:

```text
主动词块：<natural chunk>
中文意图：<Chinese intention>
不要这样说：<stiff expression, if any>
常用骨架：<one or two reusable sentence patterns>
现实例句：<natural sentence>
练习题：<one production prompt>
```

When saving, build a payload and run:

```text
npm run add-item -- --file <payload.json>
```

The payload should use:

```json
{
  "type": "chunk",
  "id": "natural chunk",
  "intention": "中文意图",
  "naturalChunk": "natural chunk",
  "avoidSaying": ["stiff expression"],
  "sentencePatterns": ["reusable pattern"],
  "realLifeExamples": ["natural sentence"],
  "usageNotes": "short note",
  "productionPrompts": ["prompt for the user"],
  "reviewInDays": 1
}
```

Use `--dry-run` first if the payload is complex.

For automatic extraction after sentence diagnosis, write the chunk immediately after feedback. Do not interrupt the practice flow with a save question.

## Drilling Chunks

If the user gives a count, use that count. If not, ask:

```text
这次主动词块训练你想练几个？例如 5、10 或 20。
```

For due chunks, run:

```text
npm run due -- --type chunk --date <YYYY-MM-DD> --limit <count> --format json
```

If there are fewer due chunks than requested, read `learning/chunks.md` and choose recent or difficult chunks.

Run one prompt at a time.

Use this format:

```text
主动词块 1/N

中文意图：<Chinese intention>
不要这样说：<stiff expression, optional>
提示骨架：<sentence pattern>
现实场景：<real-life situation>

请写 1 句自然英文，必须用到这个词块。
```

For easier practice, reveal the chunk. For harder practice, hide the chunk and ask the user to retrieve it from the Chinese intention.

Recommended progression:

1. Recognition: choose or recall the natural chunk from Chinese intention.
2. Semi-open production: fill the chunk into a sentence skeleton.
3. Free production: use the chunk in a new realistic sentence.
4. Next-day retrieval: recall yesterday's chunks without seeing the English first.

## Feedback

After the user answers, give concise production feedback:

```text
反馈：<good / almost / needs work>

你的句子：<user sentence>
更自然：<corrected sentence>
目标词块：<whether it was retrieved and used naturally>
句型骨架：<whether the frame was complete and natural>
问题：<one to three concise notes>
```

If the sentence is stiff because of word-by-word translation, name the exact chunk that should replace it.

## Diagnostics

When a meaningful issue appears, save a production diagnostic record with:

```text
npm run log-production -- --file <payload.json>
```

Use categories such as:

- `chunk-retrieval`
- `sentence-pattern`
- `natural-collocation`
- `word-choice`
- `literal-translation`
- `article-usage`
- `noun-number`
- `verb-tense`

Only log meaningful production issues, not tiny style preferences.

## Review Update

After a chunk drill, update progress with:

```text
npm run update-review -- --type chunk --id <chunk> --result <forgot|hard|good|easy> --date <YYYY-MM-DD> --note "<short note>"
```

Score based on retrieval and natural usage:

- `forgot`: cannot recall the chunk
- `hard`: recalls after heavy cueing or uses it stiffly
- `good`: uses the chunk correctly in a supported pattern
- `easy`: uses it naturally in a new situation

## End Of Session

End with:

```text
本轮完成：N/N
真正激活的词块：<chunks used well>
还不稳定的词块：<chunks needing review>
下次建议：<specific next drill>
```

Keep the tone direct and energetic. Use Chinese for instructions and feedback by default, with English for chunks and sentences.
