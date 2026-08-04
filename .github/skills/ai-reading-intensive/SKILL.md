---
name: ai-reading-intensive
description: 'Use when: 精读英文材料, intensive reading practice, user provides image of reading material, paragraph analysis, sentence breakdown, vocabulary in context, extract chunks from reading, track reading progress, 帮我精读, 精读这篇文章.'
argument-hint: '<image of reading material>'
user-invocable: true
---

# AI Reading Intensive

Use this skill when the user provides an image (screenshot, photo, or scan) of English reading material and wants to do guided intensive reading practice.

The goal is to turn one reading passage into high-quality learning output: sentence-level understanding, vocabulary in context, reusable chunks, and grammar awareness — all recorded for future review.

## Core Principle

精读不是翻译，是**用英语思维理解英语**。每段精读的核心动作是：

```text
原文图片 → 解析文字 → 通读概览 → 逐段精读 → 提炼学习项 → 记录进度
```

不要一开始就全文翻译。先帮用户建立文章的结构感，再逐段深入。

## When To Use

- 用户发来图片并说"帮我精读"、"精读这篇"
- `/ai-reading-intensive`
- 用户上传 reading 教材截图、文章图片、PDF 截图

## Learning Files

Use these project files:

- `learning/reading-log.md`: reading session index
- `learning/reading/YYYY-MM-DD-<topic-slug>.md`: one reading session record
- `learning/vocabulary.md` / `learning/words/<word>.md`: vocabulary cards
- `learning/chunks.md` / `learning/chunks/<chunk>.md`: active chunk cards
- `learning/grammar.md` / `learning/grammar/<pattern>.md`: grammar cards

Use `npm run add-item -- --file <payload.json>` to save vocabulary, chunks, and grammar.

If `learning/reading/` does not exist, create it.

## Interaction Flow

### Step 1: Parse and Display

Read the image and output the full transcribed text verbatim. Preserve paragraph structure.

```text
--- 原文 ---
[transcribed text, paragraph by paragraph]
```

Ask the user to confirm the text is correct before continuing. If OCR errors are visible, flag them.

### Step 2: Overview

Give a brief overview before diving into details:

```text
--- 文章概览 ---
📄 类型：[新闻 / 学术 / 商业 / 科技博客 / 教材 / 其他]
🎯 主题：[一句话概括]
📊 难度：[初级 / 中级 / 高级]
📝 段落数：N 段

主要内容：
[2-3句概括全文大意]

精读建议：
- 重点关注：[语法现象 / 词汇密度 / 句式结构 等]
```

### Step 3: Guided Intensive Reading

Process the text **paragraph by paragraph**. For each paragraph:

```text
--- 第 N 段 ---

原文：
[paragraph text]

📌 关键词汇：
- word/phrase: 意思 + 在本句中的作用 + 同类词对比（如有）

🔍 句子结构：
- [重点句子]: 主干是... / 修饰成分是... / 用了什么结构

💡 值得注意：
- [语法思维点 / 搭配 / 文化背景 / 作者意图]

🧱 可提炼的词块：
- [chunk 1]
- [chunk 2]
```

After each paragraph, ask:
```text
这段还有不明白的地方吗？直接问，或者回复"继续"进入下一段。
```

### Step 4: Full-Text Summary

After all paragraphs are done:

```text
--- 精读总结 ---

📚 本文核心词块：
- [top 5-8 chunks worth saving]

🧠 语法思维点：
- [1-3 grammar patterns worth noting]

🎯 理解检测（可选）：
Q1: [comprehension question]
Q2: [comprehension question]
Q3: [inference/opinion question]

💬 产出练习（可选）：
用今天学到的词块，用英文回答：[related question]
```

### Step 5: Save Progress

After the session, automatically save high-value chunks (top 3-5) using `npm run add-item`.

Ask the user before saving vocabulary and grammar items:

```text
是否保存以下内容？
1. 词汇：[word list]
2. 语法：[grammar patterns]
3. 全部保存
4. 暂不保存
```

Update the reading log index.

## Reading Log Format

### Session File: `learning/reading/YYYY-MM-DD-<topic-slug>.md`

```markdown
# Reading Session: [Title or Topic]
Date: YYYY-MM-DD
Source: [教材名 / 文章标题 / 来源]
Difficulty: [初级 / 中级 / 高级]

## Source Text

[full transcribed text]

## Key Vocabulary

| 词汇 | 意思 | 例句出处 |
|------|------|---------|
| ... | ... | ... |

## Chunks Extracted

- [chunk 1]: [usage note]
- [chunk 2]: [usage note]

## Grammar Notes

- [pattern]: [explanation]

## Comprehension Notes

[any notes the user added during reading]
```

### Index File: `learning/reading-log.md`

```markdown
# Reading Log

| 日期 | 主题 | 类型 | 难度 | 词块数 | 文件 |
|------|------|------|------|--------|------|
| 2026-08-04 | AI in Healthcare | 科技博客 | 中级 | 5 | [link](./reading/2026-08-04-ai-in-healthcare.md) |
```

Create this file if it does not exist.

## Chunk Auto-Save Rules

After completing the full session, automatically save chunks that meet these criteria:

- The chunk is a natural English expression (not a translation of Chinese)
- It is reusable in professional or daily English contexts
- It is **not** a spelling-only or article-only fix

Do not ask for confirmation before saving chunks. After saving, report:

```text
已自动保存词块：<chunk1>, <chunk2>
```

## Intensive Reading Principles

1. **词汇优先上下文**：不只给中文意思，要解释这个词在句子里做什么
2. **句子结构显性化**：帮用户看清楚主干和修饰层
3. **语法点点到为止**：点明语法现象，不展开成语法课
4. **词块驱动产出**：每段至少提炼 1-2 个真正可以用的表达块
5. **保持节奏**：一段一段来，不要一次输出全文分析

## Special Commands

| 用户说 | 行为 |
|--------|------|
| `继续` / `next` | 进入下一段 |
| `解释` / `explain` | 对当前句子做更详细的结构分析 |
| `跳过` / `skip` | 跳过当前段 |
| `总结` / `summary` | 跳到全文总结 |
| `再读一遍` | 重新输出当前段的分析 |
| `出题` / `quiz me` | 立刻出理解检测题 |
| `产出练习` / `practice` | 进入产出练习环节 |
