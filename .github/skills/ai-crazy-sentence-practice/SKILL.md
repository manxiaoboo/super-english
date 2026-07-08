---
name: ai-crazy-sentence-practice
description: 'Use when: crazy sentence practice, 疯狂造句, intensive English sentence production, making many sentences from current vocabulary, correcting user-made sentences, vocabulary-based speaking or writing drills, production diagnostics.'
argument-hint: '<count | vocabulary scope | topic>'
user-invocable: true
---

# AI Crazy Sentence Practice

Use this skill when the user wants a fast, repeated sentence-making drill based on their saved vocabulary.

The goal is production fluency: the user should make many English sentences quickly, receive concise corrections, notice recurring problems, and keep moving.

The deeper goal is to turn passive vocabulary into active expression chunks. Do not train isolated words only; train `chunk + sentence pattern + real situation` so the user can retrieve natural English under pressure.

## Core Diagnosis

The user can often understand natural corrections, but cannot easily produce them alone. Treat this as an active-retrieval problem, not a comprehension problem.

Common bottlenecks to target:

- passive vocabulary: recognizes the word but cannot retrieve it while writing
- weak chunk storage: knows words such as `test`, `build`, or `publish`, but does not automatically retrieve chunks like `run integration tests`, `the build succeeds`, or `publish a package to Artifactory`
- Chinese-to-English transfer: starts from a Chinese skeleton and fills in English words
- weak sentence skeletons: knows the words but does not automatically produce frames like `Once ... is complete, ...` or `After ... passes, ...`

Every drill should therefore force retrieval of a natural English chunk and a reusable sentence frame.

## Source Files

Use these project files as the source of truth:

- `learning/vocabulary.md`: saved vocabulary index
- `learning/words/<word>.md`: detailed word cards with meanings, fables, anchor sentences, collocations, and examples
- `learning/chunks.md`: active expression chunk index
- `learning/chunks/<chunk>.md`: detailed active chunk cards with sentence patterns and production prompts
- `learning/diagnostics.md`: recurring production weakness summary
- `learning/production-log.md`: chronological sentence-production records

## Triggers

Use this skill when the user says things like:

- 疯狂造句
- 用我现在的 vocabulary 造句
- 根据我目前的单词让我造句
- 让我连续造 10 个句子
- crazy sentence practice
- drill my vocabulary with sentences
- make me produce sentences quickly
- correct my sentences one by one

## Session Setup

Before starting, make sure there is a clear quantity limit.

If the user does not provide a number, ask one short question first:

```text
这次疯狂造句你想做几个句子？例如 5、10 或 20。
```

Optional constraints may include:

- vocabulary type: due words, newest words, hardest words, random saved words, or all vocabulary
- topic: daily life, school, work, shopping, technology, feelings, plans, or the user's own topic
- difficulty: simple, natural, IELTS-style, spoken, or writing-focused
- focus: chunk retrieval, sentence skeletons, technical writing, daily spoken English, or mixed mode

If the user gives only a number, default to due active chunks first, then due words, then fill with recent saved vocabulary if needed.

Default mode is chunk-pattern drilling. Only use isolated word prompts when the user explicitly asks for simple vocabulary practice.

## Item Selection

Start from the project root.

For due active chunks, run:

```text
npm run due -- --type chunk --date <YYYY-MM-DD> --limit <count> --format json
```

Use saved chunks first because they directly target the user's active-production bottleneck.

For due vocabulary, run:

```text
npm run due -- --type word --date <YYYY-MM-DD> --limit <count> --format json
```

Use the script output as the source of target chunks, words, and cues.

If there are fewer due chunks and words than the requested count, read `learning/chunks.md` and `learning/vocabulary.md` and choose additional saved items. Prefer chunks or words that are new, hard, recently missed, or useful in real conversation.

Read individual files in `learning/words/<word>.md` only when the index or due output does not provide enough meaning, collocation, or cue information to create a good prompt.

Do not reveal long explanations before the user writes. Give just enough cue to make production possible.

For each selected word, derive one useful target chunk before prompting. Prefer chunks that the user can reuse in real communication.

Examples:

- `provide` -> `provide a sample project for testing`
- `configure` -> `configure your npm environment`
- `test` -> `run integration tests`
- `succeed` -> `the build succeeds`
- `publish` -> `publish a package to Artifactory`
- `refer` -> `refer to this file to configure ...`

If the saved card includes collocations or anchor sentences, reuse those. If it does not, create a natural high-frequency chunk from the word's meaning and current topic.

## Drill Loop

Run one sentence at a time.

For each prompt, use chunk-pattern format by default:

```text
疯狂造句 1/N

目标词：<word>
目标词块：<natural chunk or collocation>
句型骨架：<reusable sentence pattern>
现实场景：<a realistic everyday situation>
要求：请用这个词块和句型骨架造 1 句自然英文句子。
```

Keep the target chunk visible. The purpose is not to guess the word; the purpose is to retrieve and use the chunk naturally.

Good sentence skeletons include:

- `Once ... is complete, ...`
- `After ... passes/succeeds, ...`
- `You can use ... to ...`
- `You can refer to ... to ...`
- `The goal is to help ... do ...`
- `I need to ... because ...`
- `This is useful for ...`
- `It helps me ... more systematically.`

For technical writing topics, prefer process and instruction frames:

- `After you ..., you can ...`
- `Once the tests pass and the build succeeds, ...`
- `Use ... to configure ...`
- `Refer to ... when you need to ...`
- `This package can be published to ...`

When useful, add one constraint to force better usage:

- use a specific collocation
- use past tense
- make it about yourself
- make it a question
- include a reason with because
- keep it under 15 words
- make it sound natural in conversation
- make it sound like technical documentation

Avoid giving the full model sentence before the user answers.

If the user repeatedly produces stiff sentences, temporarily reduce freedom:

```text
半开放造句：
Once <noun phrase> is complete, you can <target chunk>.
请替换尖括号里的内容，写成完整句子。
```

## Feedback Style

After each user sentence, give fast but useful feedback:

```text
反馈：<good / almost / needs work>

你的句子：<user sentence>
更自然：<corrected sentence>
词块：<whether the target chunk was used naturally>
骨架：<whether the sentence pattern was complete and natural>
问题：<one to three concise notes>
再试一次：<only if the sentence has a serious issue; otherwise move on>
```

Keep the pace high. Do not write a long grammar lecture unless the user asks.

Always correct:

- word meaning mismatch
- unnatural collocation
- wrong part of speech
- missing article
- noun number
- verb tense
- subject-verb agreement
- word order
- preposition choice
- incomplete sentence
- stiff literal translation
- missing or unnatural target chunk

If the user's sentence is already natural, say so briefly and move to the next prompt.

## Retry Rules

If the sentence has a serious issue that prevents natural meaning, ask the user to rewrite the same sentence once before moving on.

If the issue is minor, provide the correction and continue to the next item.

Do not get stuck on one sentence for more than two attempts unless the user wants detailed practice.

## Production Diagnostics

When a meaningful issue appears, save a production diagnostic record with:

```text
npm run log-production -- --file <payload.json>
```

The payload should include:

- `sourceType`: `crazy-sentence-practice`
- `sourceId`: the target word or target chunk
- `context`: the drill prompt, sentence skeleton, or real-life scene
- `userText`: the user's original sentence
- `correctedText`: the corrected sentence
- `result`: `hard`, `good`, or `easy`
- `issues`: stable issue categories with short notes and suggestions
- `generalAdvice`: one concise pattern-level suggestion when helpful

Use stable categories such as:

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
- `part-of-speech`
- `literal-translation`
- `chunk-retrieval`
- `sentence-pattern`

Only log meaningful issues. Do not log tiny style preferences.

Use `chunk-retrieval` when the user knows the word but fails to retrieve or use the intended natural chunk. Use `sentence-pattern` when the sentence frame is incomplete or unnatural even though the core vocabulary is correct.

## Automatic Active Chunk Saving

After diagnosing any complete sentence the user writes, automatically extract and save 1 to 3 high-value active chunks from the correction.

Do not ask before saving these chunks. The purpose of this mode is to turn the user's weak sentence into reusable active expression material immediately.

Save a chunk when it corrects a reusable production problem, for example:

- `do the integration testing` -> `run integration tests`
- `build successfully` -> `the build succeeds`
- `publish on Artifactory` -> `publish a package to Artifactory`
- `after unzip it` -> `After you unzip it, ...` or `After unzipping it, ...`

Use:

```text
npm run add-item -- --file <payload.json>
```

The payload should use `type: "chunk"`, with `avoidSaying`, `sentencePatterns`, `realLifeExamples`, and `productionPrompts` filled from the user's sentence and the corrected sentence.

Skip automatic saving when the correction is only a tiny spelling, punctuation, or `a/an` fix with no reusable chunk.

After saving, add one short line to the feedback:

```text
已自动加入主动词块：<chunk1>, <chunk2>
```

## Session Summary

At the end of the requested count, summarize briefly:

```text
本轮完成：N/N
表现最好：<one or two strengths>
最常见问题：<top issue categories>
本轮激活词块：<3 to 8 useful chunks practiced>
下次建议：<specific next drill idea>
```

If several recurring issues appeared, suggest reviewing the diagnostic summary next.

End with one tiny homework set when useful:

```text
今天只背这 3 个可复用表达块：
1. <chunk>
2. <chunk>
3. <chunk>
```

## Tone

Be energetic but concise. The mode should feel like a fast training session, not a classroom lecture.

Use Chinese for instructions and feedback by default, with English for target sentences and corrected examples.