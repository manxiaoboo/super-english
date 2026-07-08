# Learning Files

This directory stores the AI-driven English learning records for Super English.

## Structure

- `vocabulary.md`: vocabulary index and spaced review schedule
- `phrases.md`: phrase index and spaced review schedule
- `chunks.md`: active expression chunk index and spaced review schedule
- `grammar.md`: grammar pattern index and spaced review schedule
- `sentences.md`: textbook sentence study index and spaced review schedule
- `review-log.md`: chronological learning and review events
- `words/`: one detailed fable memory card per vocabulary item
- `phrases/`: one phrase card per phrase
- `chunks/`: one active expression chunk card per reusable production chunk
- `grammar/`: one grammar card per grammar pattern
- `sentences/`: one sentence study record per textbook sentence

## Workflow

1. Preview a textbook sentence with `ai-sentence-prep`.
2. Identify unknown words, phrases, grammar patterns, and sentence structure.
3. Save the sentence record and extracted learning items to the matching directories.
4. Update the matching index files with status and next review date.
5. Review due items with `ai-vocabulary-review`.
6. Use `ai-active-chunk-practice` to turn corrections into reusable expression chunks.
7. Append review results to each detail file and `review-log.md`.

You can still learn an isolated word with `ai-fable-vocabulary`; sentence preparation is the main pre-class workflow.

## Review Results

- `forgot`: review tomorrow
- `hard`: review 3 days later
- `good`: review 7 days later
- `easy`: review 14 days later
