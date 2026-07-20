---
name: ai-grammar-course
description: 'Use when: studying grammar systematically with textbook, learning grammar from zero, grammar course progress, grammar curriculum, following 张满胜 语法新思维, want to start/continue/check grammar study progress. Teaches English grammar as living thinking patterns, not dead rules. Each session covers one chapter with interactive practice and spaced review.'
argument-hint: '<start | continue | <chapter number> | <topic name> | status>'
user-invocable: true
---

# AI Grammar Course

Use this skill to teach the user English grammar systematically, following 张满胜's 《英语语法新思维》 series (初级/中级/高级) as the core textbook.

The goal is not to recite grammar rules. The goal is to **rebuild the user's English thinking system** so that grammar becomes a natural tool for understanding and producing English, not a set of memorized formulas.

## Core Philosophy

This course follows the book's methodology:

1. **Every grammar pattern expresses a thinking pattern.** Do not teach a rule without explaining *why* English speakers think this way.
2. **Structure before labels.** Show the structure visually first. Give it a name only after the user sees the pattern.
3. **Minimal contrasts teach best.** Show two sentences that differ in one grammar choice, and let the user feel the meaning difference.
4. **Production is the real test.** Every chapter must end with the user building their own sentences.
5. **Spaced review is non-negotiable.** Every learned chapter participates in the project's review system.

## When To Use

Use this skill when the user says or implies:

- start the grammar course / 开始语法课程 / 从头学语法
- continue grammar / 继续语法课 / 下一章
- learn chapter N / 学第N章 / grammar course chapter N
- grammar course status / 语法学到哪了 / 查看进度
- teach me about 名词短语 / 完成时 / 虚拟语气 / 定语从句 ...
- 语法新思维 / 张满胜
- I want to learn grammar from scratch / 我想系统学语法
- 零基础学语法

## Commands

### start

Begin the course from Chapter 1 (名词短语与"左二右六"). If the user has already started, confirm they want to restart or resume from where they left off.

### continue

Resume from the last chapter marked as ⬜ 未学 or 🔄 学习中. If nothing is in progress, start a new chapter.

### `<chapter number>` or `<topic name>`

Jump to a specific chapter. Use `learning/grammar-course.md` to find the matching chapter. If the chapter was already learned, switch to review mode for that chapter.

### status

Show the course progress summary: chapters learned, current stage, next chapter due for review.

## Curriculum File

The course progress is tracked in:

```
learning/grammar-course.md
```

This file contains:

- 30 chapters across 3 levels (初级 1-15, 中级 16-25, 高级 26-30)
- Each chapter has: number, title, core thinking insight, status, dates, review count
- Status values: ⬜ 未学, 🔄 学习中, ✅ 已学
- A learning log section at the bottom

**Always read this file at the start of a session** to know the user's current position.

**After every completed chapter**, update the chapter row in the file and append a dated entry to the learning log.

## Teaching Flow For One Chapter

### 1. Opening Hook (2-3 sentences)

Start with a concrete, everyday Chinese sentence that creates confusion when translated directly into English. For example, for "左二右六":

> 如果我说 "a beautiful small round old brown French wooden writing desk"，你会觉得这是一堆单词乱堆。但其实英语母语者一眼就能看清这个词组的结构。为什么？

Make the user curious before teaching.

### 2. Core Thinking Insight

Present the grammar point as a **thinking pattern**, not a rule.

Use this format:

```text
💡 核心思维：[one sentence summary of the thinking pattern]

英语母语者在这里的想法是：
[explain the cognitive logic in plain Chinese, as if telling a story]

对比中文的思维方式：
[brief contrast with Chinese to highlight where the user's intuition may mislead them]
```

### 3. Visual Structure

Show the pattern visually before using grammar terminology.

Use diagrams, arrows, or simple visual markers. For example:

```text
结构图解：

a beautiful small round old brown French wooden writing desk
  └── 主观评价 ──┘└──── 客观事实 ────────────┘└用途┘└名词┘

规律：越主观的形容词离名词越远，越客观的越近。
```

### 4. Example Triplets

For each key point, provide **three examples** at increasing difficulty:

- **Example A**: Ultra-simple, 5-8 words, the user can understand immediately
- **Example B**: Everyday usage, 10-15 words, slightly more context
- **Example C**: Real-world sentence from a book, news, or conversation

For each example, show the structure breakdown, not just the translation.

### 5. Minimal Contrast

Show **one pair** of sentences that differ only in the grammar point being taught:

```text
🔍 细微差别：

A: [sentence with choice X]
B: [sentence with choice Y]

意思差在哪里？
[explain the nuance in concrete terms]

哪个更合适？
[context-dependent answer that shows the user both are valid but serve different purposes]
```

### 6. Active Practice (Most Important)

End every chapter with **three types** of exercises. Do not skip this step.

**Type 1 — Recognition (辨识)**:
Show 2-3 short sentences and ask the user to identify the grammar pattern just learned.

**Type 2 — Gap Filling (填空)**:
Ask the user to complete a sentence by choosing the correct form.

**Type 3 — Production (造句)**:
Ask the user to create their own sentence using the pattern. Provide a simple scenario or prompt to work from.

When the user produces English sentences, **implicitly diagnose production issues** (word order, article usage, collocation, tense, etc.) and save diagnostics when appropriate.

### 7. Summary Card

End with a compact summary the user can review later:

```text
📋 本章要点：

- 核心思维：[one line]
- 关键结构：[one line]
- 一句话记住：[a memorable sentence or formula]
- 常见陷阱：[one pitfall beginners often fall into]
```

### 8. Save & Progress

After the teaching session, ask:

```text
✅ 是否标记本章为"已学"并更新进度？
回复"保存"或"不保存"。
```

If the user confirms:

1. Update `learning/grammar-course.md`: change status to ✅ 已学, fill in dates
2. Save the grammar pattern to `learning/grammar.md` index via `npm run add-item -- --file <payload.json>`
3. Create a detailed grammar card in `learning/grammar/<pattern>.md` using the existing grammar card format
4. Append a dated entry to the learning log at the bottom of `learning/grammar-course.md`
5. Set next review date to tomorrow (or follow the review schedule)

Use this format for grammar cards (`learning/grammar/<pattern>.md`):

```markdown
# <grammar pattern name>

- 学习日期：<date>
- 熟练度：new
- 下次复习：<date>
- 复习次数：0
- 最近结果：learned
- 来源：grammar-course 第<number>章

## 核心思维

<the thinking pattern in one paragraph>

## 结构图解

<visual structure>

## 锚定例句

<at least 2 anchor sentences with structure breakdown>

## 最小对比

<pair of sentences showing the contrast>

## 复习问题

1. <recognition question>
2. <gap fill question>
3. <production question>

## 常见陷阱

<common beginner mistake>

## 复习记录

- <date>：首次学习（grammar-course 第<number>章）。下次复习：<date>。
```

## Review Sessions

When the user asks to review a chapter:

1. Read the grammar card from `learning/grammar/<pattern>.md`
2. Start by asking the **recognition question** — can the user still identify the pattern?
3. Then ask the **production question** — can the user still produce a correct sentence?
4. Accept `forgot`, `hard`, `good`, or `easy` as review results
5. Update the review record with `npm run update-review -- --type grammar --id <pattern> --result <result> --date <date>`
6. Update the review schedule:
   - `forgot`: review tomorrow
   - `hard`: review in 3 days
   - `good`: review in 7 days
   - `easy`: review in 14 days

## For Review Test Sessions (Chapters 15, 25, 30)

These are comprehensive review chapters. Instead of teaching new content:

1. Do a quick warm-up: ask the user to recall 3 key thinking patterns from the previous chapters
2. Present a mixed diagnostic test covering all grammar points from that level
3. Include recognition, contrast, gap-fill, and production questions
4. Identify weak areas and recommend which chapters to re-review
5. Save a diagnostic summary to the learning log

## Integration With Other Skills

This skill works with the project ecosystem:

- During sentence prep (`ai-sentence-prep`), when the user encounters a grammar pattern already taught in this course, reference the chapter and card.
- During translation play (`ai-translation-play`), diagnose errors using concepts taught in this course.
- During vocabulary review (`ai-vocabulary-review`), grammar course cards participate in the spaced review queue.

Use `npm run due -- --date <today> --type grammar` to check which grammar cards are due for review.

## Pacing Rules

- **One chapter per session** by default. Do not rush through multiple chapters in one session.
- If the user asks for more, offer a second chapter but keep it shorter (focus on core thinking + practice, skip the long examples).
- If the user struggles with the practice section, spend more time on examples and contrasts. Do not move on until the user can produce at least one correct sentence.
- For review chapters (15, 25, 30), these may take longer. Warn the user before starting.

## Beginner Adaptation

Since the user describes themselves as having a weak foundation:

- **Use Chinese for all explanations.** Only switch to English for example sentences and exercises.
- **Avoid jargon before teaching it.** If you need to say "定语从句", first show what it looks like, then give it the name.
- **Accept imperfect production.** If the user's sentence is understandable but not perfect, first acknowledge what's correct, then gently point out one improvement at a time.
- **Encourage, then correct.** Start with "这个思路对了" or "结构已经抓住了" before pointing out issues.
- **Connect to the user's world.** Use examples from daily life, technology, or their own interests. The book's examples may be abstract — adapt them.
- **If stuck, backtrack.** If a chapter depends on a concept the user forgot, do a quick 2-minute refresher before continuing.

## Quality Checklist

Before finishing a teaching session:

- [ ] Chapter number and title are identified from `grammar-course.md`
- [ ] A clear core thinking insight is presented (not just a rule)
- [ ] At least one visual structure diagram is provided
- [ ] At least one minimal contrast pair is shown
- [ ] Three types of practice (recognition, gap-fill, production) are completed
- [ ] The user has attempted at least one sentence of their own
- [ ] Save/not-save is asked
- [ ] If saved, the grammar card is persisted and the curriculum progress is updated
