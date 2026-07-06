# Super English

Super English 是一个借助 AI 提升英语学习效率的项目，目标是帮助学习者更系统地记忆单词、巩固语法、完成记忆练习，并进行日常测试。

## 项目目的

本项目希望通过 AI 的辅助能力，将英语学习中的重复记忆、语法理解和阶段性检测变得更加个性化、持续化和可追踪。

主要目标包括：

- 使用 AI 帮助记忆单词，包括词义、例句、发音提示和语境联想。
- 通过针对性的语法讲解与练习，巩固英语语法基础。
- 提供记忆练习，帮助用户反复回顾、强化和检测学习内容。
- 支持日常测试，用于检查单词掌握情况、语法理解情况和学习进度。

## 功能方向

- 单词记忆：根据用户学习进度生成单词解释、例句和复习内容。
- 语法巩固：围绕常见语法点提供讲解、示例和练习题。
- 记忆练习：通过问答、填空、选择题等方式强化记忆。
- 日常测试：生成每日测试内容，帮助用户持续检查学习效果。
- 学习反馈：基于测试结果总结薄弱点，并给出后续复习建议。

## 当前形态

本项目当前不以传统程序或图形界面为核心，而是以 AI Skill 的形式驱动学习流程。

为了降低长期使用时的 token 消耗，项目也提供少量 Node 脚本处理机械任务，例如扫描到期复习项、更新复习记录和生成句子编号。AI 主要负责理解、讲解、追问和反馈。

项目现在也支持隐式造句诊断：当你在复习或预习中尝试自己造句时，系统不仅纠错，还会持续累计你最常见的表达问题，并给出阶段性改进建议。

已提供的 Skill：

- `ai-sentence-prep`：输入看不懂的教材句子，AI 拆句、询问陌生单词/短语/语法，并将学习项保存到项目中。
- `ai-fable-vocabulary`：通过荒诞寓言、联想记忆、真实例句和主动回忆测试来学习新单词。
- `ai-translation-play`：输入中文原文和自己的英文翻译，AI 判断是否自然，诊断单词/短语/语法问题，并询问是否加入诊断记录和知识库。
- `ai-vocabulary-review`：读取已保存的单词、短语、语法和句子学习记录，按复习日期生成主动回忆测试，并更新复习记录。
- `ai-production-diagnostic-report`：基于累计的造句诊断记录，生成阶段性能力缺口分析和训练建议。

使用时可以在支持 Skill 的 AI 助手中调用对应能力，并输入教材句子、单词、短语或复习指令。

## 学习档案

学习记录保存在 `learning/` 目录中：

- `learning/vocabulary.md`：单词总索引，记录学习日期、下次复习日期、复习次数和最近结果。
- `learning/phrases.md`：短语总索引。
- `learning/grammar.md`：语法点总索引。
- `learning/sentences.md`：教材句子学习索引。
- `learning/words/`：每个单词一份详细的寓言记忆卡。
- `learning/phrases/`：每个短语一份学习卡。
- `learning/grammar/`：每个语法点一份学习卡。
- `learning/sentences/`：每个教材句子一份拆解和复习记录。
- `learning/review-log.md`：按日期记录学习和复习事件。
- `learning/diagnostics.md`：累计造句问题类别、出现次数、最近出现时间和改进建议。
- `learning/production-log.md`：按日期记录你的原句、建议表达和诊断问题。

推荐日常流程：

1. 教材预习：调用 `ai-sentence-prep`，输入看不懂的教材句子。
2. 标记陌生点：让 AI 询问并确认陌生单词、短语和语法。
3. 保存学习项：AI 将句子、单词、短语和语法保存到 `learning/` 对应目录和索引中。
4. 翻译试玩：调用 `ai-translation-play`，输入中文原文和自己的英文翻译，获得自然度反馈和问题诊断。
5. 每日复习：调用 `ai-vocabulary-review`，让 AI 复习今天到期的所有学习项。
6. 造句诊断：当你回答问题、自己造句或尝试翻译时，AI 会隐式记录高频表达问题。
7. 更新进度：根据回答结果标记 `forgot`、`hard`、`good` 或 `easy`，并更新下次复习日期。

示例：

```text
/ai-sentence-prep The boy who was sitting near the window had never seen such a beautiful view before.
```

```text
/ai-fable-vocabulary consistent
```

```text
/ai-vocabulary-review today
```

```text
/ai-translation-play 原文：这个项目分为三个阶段。 我的翻译：This project has three phrases.
```

```text
/ai-production-diagnostic-report weekly
```

## Node 脚本

用于减少 AI 读取大量 Markdown 的 token 消耗：

```text
npm run add-item -- --file item.json
```

新增或更新一个学习项，自动写入详情文件、索引和学习日志。

```text
npm run add-item -- --type word --id example --meaning "a sample word" --date 2026-07-07 --dry-run
```

预演新增学习项，不写入文件。

```text
npm run due -- --date 2026-07-07
```

扫描到期学习项，并只输出复习需要的线索。

```text
npm run due -- --date 2026-07-07 --type grammar --limit 5
```

只扫描某一类学习项。

```text
npm run update-review -- --type word --id fable --result good --date 2026-07-07 --note "能回忆单词和核心意思，造句需更自然"
```

更新索引、单词卡复习记录和总复习日志。

可以先加 `--dry-run` 预览结果，不写入文件。

```text
npm run next-sentence-id -- --date 2026-07-07
```

生成下一条教材句子学习记录 ID。

```text
npm run log-production -- --file production.json
```

记录一次造句诊断，自动更新 `learning/production-log.md` 和 `learning/diagnostics.md`。

```text
npm run log-production -- --file scripts/examples/translation-diagnostic.json --dry-run
```

预演一次翻译试玩诊断记录，不写入文件。

```text
npm run diagnostic-summary -- --limit 5
```

输出你最常见的句子表达问题类别和建议，便于 AI 做阶段性总结。

## 适用场景

- 日常英语单词背诵
- 英语语法专项练习
- 考试前的复习与自测
- 长期英语学习计划跟踪

## 愿景

Super English 希望成为一个轻量、实用、可持续迭代的 AI 英语学习助手，让学习者能够在每天的练习中不断积累、复习和提升。