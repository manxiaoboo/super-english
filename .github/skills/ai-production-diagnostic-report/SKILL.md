---
name: ai-production-diagnostic-report
description: 'Use when: analyzing English sentence production weaknesses, stage diagnostic report, weekly diagnostic summary, monthly diagnostic summary, writing weaknesses, speaking/writing habit analysis, ability gap analysis, improvement suggestions from learning/diagnostics.md and learning/production-log.md.'
argument-hint: '<weekly | monthly | all | latest>'
user-invocable: true
---

# AI Production Diagnostic Report

Use this skill to summarize the user's sentence-production weaknesses based on saved diagnostic records.

The goal is to answer a higher-level question:

```text
When I try to express full English sentences, what ability am I actually missing?
```

This skill should not only list mistakes. It should infer missing capabilities, explain patterns, and suggest focused training priorities.

## Data Sources

Use these files and scripts:

- `learning/diagnostics.md`: aggregated issue categories
- `learning/production-log.md`: original sentences, corrected sentences, and issue notes
- `npm run diagnostic-summary -- --limit <N>`: compact summary of most frequent issue categories

Prefer the script output first. Only read `learning/production-log.md` when you need concrete examples or recent evidence.

## When To Use

Use this skill when the user asks for:

- a weekly diagnosis
- a monthly diagnosis
- a stage report
- an ability gap analysis
- why their English sentences still feel weak
- what they are missing when making full sentences
- a targeted improvement plan
- a summary of frequent sentence problems

## Report Workflow

### 1. Get Aggregate Summary

Run:

```text
npm run diagnostic-summary -- --limit 5
```

Use this as the primary diagnostic snapshot.

### 2. Gather Supporting Evidence

If the summary alone is too abstract, read `learning/production-log.md` and pull 2 to 5 representative examples.

Prefer recent examples and repeated patterns over isolated one-off mistakes.

### 3. Infer Missing Abilities

Map issue categories to underlying missing abilities.

Examples:

- `noun-number`, `article-usage` -> weak noun phrase control
- `verb-tense`, `subject-verb-agreement` -> weak clause grammar control
- `word-order`, `missing-main-clause`, `incomplete-sentence` -> weak sentence architecture
- `word-choice`, `natural-collocation`, `preposition-choice` -> weak natural expression and collocation control

Do not stop at surface errors. Explain the deeper missing ability.

### 4. Produce A Stage Report

Use this structure:

```text
阶段性诊断结论：

你的高频问题：
1.
2.
3.

更底层的能力缺口：
1.
2.
3.

证据：
- 问题类别：...
- 代表现象：...

当前最应该优先补的能力：
1.
2.

接下来 7 天训练建议：
1.
2.
3.
```

### 5. Make Suggestions Actionable

Every recommendation should be trainable.

Good suggestions:

- write 5 plural-countable noun phrases each day
- rewrite 5 sentences by correcting article usage
- imitate 3 anchor sentences with the same collocation pattern
- identify the main clause before writing a longer sentence

Bad suggestions:

- pay more attention
- improve grammar
- practice more

## Time Scope

If the user asks for `weekly`, focus on the most recent records and frame the report as a short-cycle adjustment.

If the user asks for `monthly` or `all`, emphasize long-term repeated issues and learning priorities.

If there is not enough data, say so clearly and give a lighter provisional diagnosis.

## Quality Checklist

Before finalizing the report, check that:

- the report distinguishes surface mistakes from missing abilities
- the conclusions are based on saved diagnostics, not guesswork
- at least one or two representative examples support the diagnosis when available
- the improvement advice is specific and trainable
- the report prioritizes the user's biggest bottleneck instead of listing everything equally