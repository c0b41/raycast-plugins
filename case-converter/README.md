# Case Converter

Convert clipboard text to different cases and paste instantly — no UI, no friction.

## Commands

| Command | Example |
|---|---|
| **Convert to Lowercase** | `hello world` |
| **Convert to Uppercase** | `HELLO WORLD` |
| **Convert to Sentence Case** | `Hello world` |
| **Convert to Capitalized Case** | `Hello World` |
| **Convert to Title Case** | `Hello World` *(skips small words like "a", "the", "of")* |
| **Convert to Alternating Case** | `HeLlO wOrLd` |
| **Convert to Inverse Case** | `hELLO wORLD` |

## Usage

1. Select and copy any text
2. Trigger a command from Raycast
3. The converted text is pasted directly into your focused text field

> **Tip:** Assign keyboard shortcuts to your most-used commands in Raycast settings for instant access.

## Notes

- Supports Turkish locale — detects Turkish characters automatically and uses correct locale-aware casing
- Text is always copied to clipboard as a fallback, even if paste doesn't land
