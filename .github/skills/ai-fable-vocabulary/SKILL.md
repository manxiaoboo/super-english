---
name: ai-fable-vocabulary
description: 'Use when: learning new English words with AI, vocabulary memorization, fable memory, associative memory, absurd stories, mnemonic cards, spaced review, grammar-aware word usage, saving learned words. Creates AI-driven fable-based vocabulary memory cards and persists them to learning files.'
argument-hint: '<word or word list>'
user-invocable: true
---

# AI Fable Vocabulary

Use this skill to help the user learn new English words through AI-generated associative memory, especially absurd fables, vivid images, personal examples, and active recall.

The goal is not only to make the word memorable, but also to help the user use it accurately in real English.

## Core Principle

Every word must be learned through two layers:

1. **Absurd association**: creates a vivid, strange, memorable story for fast first memory.
2. **Real usage correction**: anchors the word in accurate meaning, collocations, grammar, and examples.

Do not let the story replace the meaning. The story is a hook; real usage is the target.

## When To Use

Use this skill when the user wants to:

- learn a new English word
- memorize vocabulary with AI
- create a mnemonic story or fable
- strengthen word memory through association
- review previously learned words
- generate daily vocabulary tests
- compare confusing words
- learn a word's grammar, collocations, or example usage

## Input Handling

If the user provides one word, create one full memory card.

If the user provides multiple words, create compact cards for each word and then a short combined fable that links all words together.

If the user provides a phrase, phrasal verb, or idiom, treat it as one vocabulary item and explain its natural usage.

If the user's word has multiple common meanings, prioritize the most frequent meaning first, then mention other important meanings briefly.

If the word is advanced, formal, informal, literary, or domain-specific, state that clearly.

## Output Format For One Word

Use this structure:

```text
单词：
发音：
词性：
核心意思：
核心动作/画面：
中文释义：

荒诞寓言：

寓意：

记忆钩子：
英文锚定句：
常见搭配：
个人化例句：
易混词/注意点：

主动回忆测试：
1.
2.
3.

间隔复习建议：
```

## Output Format For Multiple Words

Use this structure:

```text
本次单词：

1. word
   核心意思：
   记忆钩子：
   英文锚定句：

2. word
   核心意思：
   记忆钩子：
   英文锚定句：

组合寓言：

主动回忆测试：
1.
2.
3.
```

## Fable Rules

Create the fable in Chinese unless the user asks for English.

Keep a single-word fable around 80 to 150 Chinese characters.

A good fable must include:

- a vivid character or object
- a strange or exaggerated event
- a clear conflict or problem
- an action that directly expresses the word's core meaning
- a short moral that reinforces the meaning

The fable may be absurd, but the word meaning must be accurate.

Avoid random stories that only mention the word. The whole story should embody the word's meaning.

## Meaning Rules

For every word, first reduce it to a simple English core meaning, such as:

- retain = keep and not lose
- abandon = leave behind
- expand = make bigger
- resist = push back against
- observe = watch carefully
- adapt = change to fit a new situation

Prefer simple English explanations over dictionary-heavy definitions.

Include Chinese explanation, but do not rely only on Chinese translation.

## Association Rules

Use one or more of these association types when helpful:

- sound association: a memorable sound-based hook
- visual association: a clear mental image
- shape association: a memory hook based on spelling or word shape
- root/affix association: only when accurate and useful
- personal association: connect the word to the user's study, work, interests, or daily life

When a spelling or sound association is not etymologically true, label it as a memory hook, not a word origin.

Do not invent false etymology.

## Usage Rules

Always include at least one natural English anchor sentence.

For verbs, include common object patterns or prepositions when useful.

For nouns, include countability or common adjective/verb collocations when useful.

For adjectives, include common nouns they modify and common degree adverbs when useful.

For phrasal verbs and idioms, include register, literal meaning if helpful, and one realistic situation.

## Active Recall Rules

Every card must end with active recall questions.

Use questions that test different directions:

- story to word: Which word matches this fable image?
- word to meaning: What is the core meaning?
- meaning to usage: Use the word in a sentence.
- collocation check: Which phrase sounds natural?
- confusion check: How is this different from a similar word?

Do not only ask recognition questions. Include at least one production question.

When the user answers with their own English sentence, diagnose the production quality implicitly.

Classify recurring issues into stable categories, for example:

- `noun-number`
- `article-usage`
- `verb-tense`
- `subject-verb-agreement`
- `word-choice`
- `natural-collocation`
- `word-order`
- `preposition-choice`
- `incomplete-sentence`

If at least one meaningful issue appears in the user's sentence, save a production diagnostic record with:

```text
npm run log-production -- --file <payload.json>
```

The payload should include:

- the reviewed word as `sourceId`
- the user's original sentence
- a corrected sentence when needed
- stable issue categories
- concise problem notes
- one or two improvement suggestions

Do this especially when the user is attempting active recall or personal example sentences.

## Review Schedule

Recommend this default review rhythm:

- immediately after learning
- later the same day
- next day
- day 4
- day 7
- day 14

During review, show the fable image or hook first, ask the user to recall the word, then ask for meaning and usage.

## Persistence Rules

When the user asks to save, persist, record, or keep a learned word, update the project learning files after generating the card.

Prefer the Node script for persistence instead of manually editing Markdown:

```text
npm run add-item -- --file <payload.json>
```

Use `--dry-run` first when the payload is complex.

Use these paths:

- `learning/words/<word>.md`: one detailed card per word
- `learning/vocabulary.md`: one table row per vocabulary item
- `learning/review-log.md`: chronological review and learning events

For file names, use the lowercase vocabulary item. Replace spaces in phrases with hyphens. Keep only letters, numbers, and hyphens when practical.

When saving a new word:

1. Generate the full memory card content.
2. Build a structured JSON payload with `type: "word"`, `id`, `meaning`, and either full `markdown` or card fields.
3. Run `npm run add-item -- --file <payload.json>` to create or update the detail file, index row, and learning log.

Default metadata for a new word:

- status: `new`
- learned at: today's date
- next review: tomorrow
- review count: `0`

If a word already exists, update the existing card instead of creating a duplicate.

Do not overwrite user review history. Append new notes under the card's review history.

Avoid reading all of `learning/vocabulary.md` or all word files for routine saves. Let `add-item` handle table updates.

For sentence-production diagnostics during word learning or review, prefer:

```text
npm run log-production -- --file <payload.json>
```

so the project accumulates long-term evidence about the user's sentence habits.

## Quality Checklist

Before finalizing an answer, check that:

- the core meaning is accurate
- the fable directly expresses the core meaning
- the mnemonic is clearly marked as a memory hook if it is not real etymology
- the English sentence is natural
- common collocations are useful and high-frequency
- the active recall questions require the user to retrieve, not just reread

## Example

```text
单词：retain
发音：/rɪˈteɪn/
词性：verb
核心意思：to keep something and not lose it
核心动作/画面：主动抓住并保留
中文释义：保留；保持；记住

荒诞寓言：
有个小学生把新学的单词装进一只会漏水的水桶。夜里，大风把水桶吹得东倒西歪，单词像小鱼一样往外跳。他赶紧用双手堵住洞口，还给水桶系上腰带。风问：“你干嘛这么紧张？”他说：“这些不是纸片，是我明天还要 retain 的记忆。”

寓意：真正重要的东西，要主动保留，不让它流失。

记忆钩子：retain = keep and not lose，像用手抓住快要漏掉的记忆。
英文锚定句：Daily review helps me retain new words.
常见搭配：retain information / retain memory / retain customers / retain control
个人化例句：I use fable stories to retain difficult vocabulary.
易混词/注意点：remain 表示“仍然是、留下”；retain 强调“主动保留”。

主动回忆测试：
1. 那个堵住漏水桶、不让单词跑掉的画面，对应哪个英文单词？
2. retain 的核心意思是 keep and not lose，还是 leave behind？
3. 用 retain 写一句和学习有关的英文句子。

间隔复习建议：今天晚些时候复习一次，明天只看“漏水桶里的单词”这个画面，先回忆单词，再造句。
```