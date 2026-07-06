---
name: ai-vocabulary-review
description: 'Use when: reviewing saved English learning items, daily review, spaced repetition, due words, due grammar, due phrases, due sentences, recall tests, updating progress. Reads learning indexes and quizzes due words, phrases, grammar, and sentence study records.'
argument-hint: '<today | due | word | grammar | phrase | sentence | all>'
user-invocable: true
---

# AI Vocabulary Review

Use this skill to review learning items saved by `ai-fable-vocabulary` and `ai-sentence-prep`.

The goal is to make review retrieval-based: show cues first, ask the user to recall, then check meaning, structure, and usage.

## Learning Files

Use these project files as the source of truth:

- `learning/vocabulary.md`: vocabulary index and scheduling table
- `learning/words/<word>.md`: detailed word memory card
- `learning/phrases.md`: phrase index and scheduling table
- `learning/phrases/<phrase>.md`: detailed phrase card
- `learning/grammar.md`: grammar index and scheduling table
- `learning/grammar/<pattern>.md`: detailed grammar card
- `learning/sentences.md`: sentence study index and scheduling table
- `learning/sentences/<id>.md`: detailed sentence study record
- `learning/review-log.md`: chronological learning and review events

If the learning files do not exist, create them using the structure described below.

## Review Triggers

Use this skill when the user says things like:

- 复习今天的单词
- review today's words
- review due words
- review due grammar
- review due phrases
- review due sentences
- test my vocabulary
- test my sentence understanding
- 复习 fable
- 复习今天的语法
- 复习教材句子
- show words due today
- update my vocabulary progress

## Due Item Selection

When the user asks for today's review:

1. Run `npm run due -- --date <YYYY-MM-DD>` from the project root.
2. Use the script output as the due item list and cue source.
3. Do not read full detail files unless the script output is missing information needed for the quiz.
4. Quiz the user without showing the answer first.

If no items are due, offer a light review of the newest or hardest items.

Use `--type word`, `--type phrase`, `--type grammar`, or `--type sentence` when the user asks for a specific category.

Use `--limit <number>` for long due lists so the session stays focused.

## Quiz Format

For each word, show only cues first:

```text
复习 1/N

记忆画面：
<core image or fable hook>

问题：
1. 这个画面对应哪个英文单词？
2. 它的核心意思是什么？
3. 用它造一句英文句子。
```

Do not reveal the answer until the user responds, unless the user explicitly asks to see the answer.

For each phrase, use:

```text
复习 1/N

短语使用场景：
<context or original sentence chunk>

问题：
1. 这个短语是什么意思？
2. 它在原句中起什么作用？
3. 用这个短语造一句英文句子。
```

For each grammar item, use:

```text
复习 1/N

表达意图提示：
<what this grammar helps express>

问题：
1. 这个语法结构的核心形式是什么？
2. 它在原句中表达什么关系或意图？
3. 用这个结构造一句和自己有关的英文句子。
```

For each sentence, use:

```text
复习 1/N

原句：
<sentence>

问题：
1. 这句话的主干是什么？
2. 主要修饰部分是什么？修饰谁或说明什么？
3. 句中关键语法表达什么意图？
4. 请自然翻译整句。
```

## Scoring

After the user answers, score the review as one of:

- `forgot`: cannot recall the item or core meaning/structure
- `hard`: recalls after effort, usage or sentence analysis is weak
- `good`: recalls meaning/structure and gives a mostly natural answer
- `easy`: recalls quickly and uses or analyzes it naturally

Give concise feedback. Correct grammar and usage when needed.

When the user writes a sentence as part of the answer, implicitly diagnose the production quality.

Classify recurring issues into stable categories, for example:

- `noun-number`
- `article-usage`
- `verb-tense`
- `subject-verb-agreement`
- `word-choice`
- `natural-collocation`
- `missing-main-clause`
- `incomplete-sentence`
- `word-order`
- `preposition-choice`

If at least one meaningful issue appears, save a production diagnostic record with:

```text
npm run log-production -- --file <payload.json>
```

The payload should include the user's original sentence, a corrected sentence when needed, issue categories, short notes, and improvement suggestions.

## Next Review Schedule

Use this simple schedule:

- `forgot`: tomorrow
- `hard`: 3 days later
- `good`: 7 days later
- `easy`: 14 days later

For mature items with 5 or more successful reviews, `easy` can move to 30 days later.

## Update Rules

After each review session:

1. Run `npm run update-review -- --type <type> --id <id> --result <forgot|hard|good|easy> --date <YYYY-MM-DD> --note "<short note>"`.
2. Let the script update the index row, append the detail-file review entry, and append `learning/review-log.md`.
3. Read files only if the script reports an error or the user asks to inspect the saved records.

Do not delete previous review records.

If a row or file is missing, repair it from the available source instead of stopping.

## Token Saving Rules

Prefer scripts for mechanical work:

- due item discovery: `npm run due -- --date <YYYY-MM-DD>`
- category-specific review: `npm run due -- --date <YYYY-MM-DD> --type grammar`
- review persistence: `npm run update-review -- --type word --id fable --result good --date <YYYY-MM-DD>`
- production diagnostics: `npm run log-production -- --file <payload.json>`
- diagnostic summaries: `npm run diagnostic-summary -- --limit 5`

Avoid reading every file in `learning/` for routine review. The script output is the compact working context.

During longer review sessions, consult `npm run diagnostic-summary -- --limit 5` to identify the user's most frequent sentence-production weaknesses and adapt feedback accordingly.

## Vocabulary Index Schema

Use this table in `learning/vocabulary.md`:

```markdown
| Word | Meaning | Status | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---|---:|---|
```

Recommended statuses:

- `new`
- `learning`
- `reviewing`
- `mature`

## Phrase Index Schema

Use this table in `learning/phrases.md`:

```markdown
| Phrase | Meaning | Status | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---|---:|---|
```

## Grammar Index Schema

Use this table in `learning/grammar.md`:

```markdown
| Grammar | Intention | Status | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---|---:|---|
```

## Sentence Index Schema

Use this table in `learning/sentences.md`:

```markdown
| ID | Sentence | Learned At | Next Review | Review Count | Last Result |
|---|---|---|---|---:|---|
```

## Word Card Required Fields

Each word file should include:

- pronunciation
- part of speech
- core meaning
- core image
- Chinese meaning
- absurd fable
- memory hook
- English anchor sentence
- common collocations
- confusing words or notes
- active recall tests
- review history

## Sentence Review Required Fields

Each sentence file should include:

- original sentence
- unknown words, phrases, and grammar
- main clause
- modifiers or extra information
- chunk meaning
- translation
- learned item links
- review questions
- review history

## Review Log Format

Append entries like:

```markdown
## 2026-07-06

- learned `fable`; next review: 2026-07-07
- reviewed `vocabulary`: good; next review: 2026-07-13
- learned sentence `2026-07-06-001`; next review: 2026-07-07
- reviewed grammar `present-perfect`: hard; next review: 2026-07-09
```

## Quality Checklist

Before ending a review session, check that:

- due words were selected from the index
- due phrases, grammar, and sentences were included when available
- answers were tested before being revealed
- next review dates were updated
- review count was incremented
- the detail file and review log were appended, not overwritten