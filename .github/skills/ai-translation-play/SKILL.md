---
name: ai-translation-play
description: 'Use when: Chinese to English translation practice, user provides a Chinese sentence and their English translation, translation feedback, playful translation practice, diagnose word choice grammar phrases, ask whether to save diagnostics or add knowledge items.'
argument-hint: '<Chinese source + my English translation>'
user-invocable: true
---

# AI Translation Play

Use this skill when the user sees a Chinese sentence while browsing the web or reading a document and wants to try translating it into English.

The goal is to make translation practice feel lightweight while still extracting useful long-term learning signals.

## Core Principle

The workflow is:

```text
Chinese source -> user's English attempt -> translation judgment -> issue diagnosis -> automatically save active chunks -> ask whether to save diagnostics and other knowledge items
```

Do not treat every translation as a formal exam. Keep the feedback practical, specific, and focused on the user's sentence-production habits.

## When To Use

Use this skill when the user provides:

- a Chinese sentence and an English translation attempt
- “我这样翻译对吗”
- “帮我看看这个翻译”
- “玩一下翻译”
- “中文原文 + 我的英文”
- translation practice from browsing, documents, textbook notes, or daily life

## Input Format

Accept flexible input. Examples:

```text
原文：我想每天坚持学习英语单词。
我的翻译：I hope I can consistant that learning English words everyday.
```

```text
中文：这个项目分为三个阶段。
英文：This project has three phrases.
```

If the Chinese source or user translation is missing, ask for the missing part.

## Feedback Format

Use this structure:

```text
你的翻译：
...

整体判断：
可理解 / 基本正确 / 需要改进 / 容易误解

更自然的表达：
...

问题诊断：
1. ...
2. ...

自动提炼的主动词块：
- ...

涉及的知识点：
- 单词：...
- 短语：...
- 语法：...

建议练习：
...

是否保存？
1. 保存到诊断记录
2. 把相关单词/短语/语法加入知识库
3. 两者都保存
4. 暂不保存
```

## Diagnosis Rules

Classify issues using stable categories so long-term summaries remain useful:

- `noun-number`
- `article-usage`
- `verb-tense`
- `subject-verb-agreement`
- `word-choice`
- `natural-collocation`
- `word-order`
- `preposition-choice`
- `incomplete-sentence`
- `missing-main-clause`
- `literal-translation`
- `meaning-shift`

Focus on the reason behind the issue, not only the corrected sentence.

Examples:

- `phrases` vs `phases` -> `word-choice`
- “I hope I can consistent” -> `word-form` or `incomplete-sentence`
- “learn words everyday” vs “learn words every day” -> `word-choice` or spelling/usage note
- unnatural direct translation -> `literal-translation` or `natural-collocation`

If a category is not listed but clearly useful, create a short lowercase kebab-case category.

## Save To Diagnostics

If the user chooses to save the diagnostic record, build a payload and run:

```text
npm run log-production -- --file <payload.json>
```

The payload should include:

```json
{
  "date": "YYYY-MM-DD",
  "sourceType": "translation-play",
  "sourceId": "short-id-or-topic",
  "context": "translation-play",
  "result": "good|hard|needs-improvement",
  "sourceText": "中文原文",
  "userText": "用户英文翻译",
  "correctedText": "更自然的英文表达",
  "generalAdvice": "一句总体建议",
  "issues": [
    {
      "category": "word-choice",
      "note": "问题说明",
      "suggestion": "可训练的建议"
    }
  ]
}
```

Use `--dry-run` first if the record is complex.

## Automatic Active Chunk Saving

After diagnosing the user's full English translation attempt, automatically extract and save 1 to 3 high-value active chunks from the improved expression.

Do not ask for confirmation before saving active chunks. This automatic saving applies only to reusable active expression chunks, not to all vocabulary, grammar, phrase, or sentence records.

Use:

```text
npm run add-item -- --file <payload.json>
```

The payload should use `type: "chunk"` and include:

- `id`: the natural chunk
- `intention`: the Chinese intention
- `naturalChunk`: the corrected reusable expression
- `avoidSaying`: the user's stiff or Chinese-shaped expression when available
- `sentencePatterns`: one or two reusable patterns
- `realLifeExamples`: the improved sentence or a realistic variant
- `usageNotes`: a short note explaining why the chunk is natural
- `productionPrompts`: one prompt for later active retrieval

Prioritize chunks that directly fix the user's problem, such as natural collocations, technical-process expressions, preposition patterns, and sentence frames.

Skip automatic saving when the correction is only spelling, punctuation, or a tiny article change with no reusable expression value.

After saving, include a short line in the feedback:

```text
已自动加入主动词块：<chunk1>, <chunk2>
```

## Add To Knowledge Base

If the user chooses to add related knowledge items, use:

```text
npm run add-item -- --file <payload.json>
```

Possible knowledge items:

- active chunks are saved automatically after full-sentence diagnosis
- confused words, such as `phrases` vs `phases`
- useful phrases from the better translation
- grammar patterns exposed by the user's error
- sentence records if the source sentence is worth reviewing later

Ask before adding non-chunk knowledge items. Do not silently add many vocabulary, grammar, phrase, or sentence records.

Prioritize 1 to 3 high-value items per translation attempt.

## Interaction Rules

For a single translation attempt, first give feedback and then ask what to save.

Automatically save high-value active chunks after full-sentence diagnosis. For non-chunk diagnostics or knowledge items, do not write files until the user confirms.

When saving anything, use scripts for persistence instead of manual Markdown edits.

If the user's translation is already good, still point out one optional upgrade if useful, but do not force a diagnostic issue.

## Quality Checklist

Before finalizing feedback, check that:

- the Chinese source meaning is preserved
- the improved English is natural, not just grammatically correct
- issues are categorized consistently
- the advice is trainable
- high-value active chunks are automatically saved after full-sentence diagnosis
- the user is asked whether to save diagnostics and non-chunk knowledge items
- scripts are used for persistence