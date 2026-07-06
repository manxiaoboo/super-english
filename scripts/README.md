# Scripts

These Node scripts handle mechanical learning-file operations so the AI does not need to read or rewrite large Markdown files during routine work.

## Commands

```text
npm run add-item -- --file item.json
```

Adds or updates a learning item from structured JSON. It writes the detail file, upserts the index row, and appends `learning/review-log.md`.

See `./examples/word-preview.json` for a word payload example.

```text
npm run add-item -- --type word --id example --meaning "a sample word" --date 2026-07-07 --dry-run
```

Previews an add/update without writing files.

```text
npm run log-production -- --file scripts/examples/production-diagnostic.json
```

Logs one sentence-production diagnostic, appends `learning/production-log.md`, and updates the aggregate table in `learning/diagnostics.md`.

```text
npm run diagnostic-summary -- --limit 5
```

Prints the most frequent production issues so the AI can summarize the user's weak points quickly.

```text
npm run due -- --date 2026-07-07
```

Scans all learning indexes and prints due items with compact review cues.

```text
npm run due -- --date 2026-07-07 --type word --limit 5
```

Scans one item type only. Supported types: `word`, `phrase`, `grammar`, `sentence`.

```text
npm run update-review -- --type word --id fable --result good --date 2026-07-07 --note "short feedback"
```

Updates the matching index row, appends the detail-file review history, and appends `learning/review-log.md`.

Add `--dry-run` to preview the calculated next review without writing files.

```text
npm run next-sentence-id -- --date 2026-07-07
```

Prints the next sentence study ID, such as `2026-07-07-001`.

## Review Results

- `forgot`: next review tomorrow
- `hard`: next review 3 days later
- `good`: next review 7 days later
- `easy`: next review 14 days later, or 30 days for mature items