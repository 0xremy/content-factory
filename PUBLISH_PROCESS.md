# 🚀 DENVER Auto-Publish Process

## Workflow
1. **Read Queue**: Main agent checks `POSTING_QUEUE.json` for `status == "pending"`.
2. **Brainstorm**: Spawn `DENVER` with a strict prompt:
   - *Task*: "Write a high-signal X post about [TOPIC]. Max 16 tokens. Be contrarian, sharp, and insider-coded. No hashtags, no emojis unless they are 🜂. Output ONLY the post text."
3. **Execute (Zero-Cost)**: Run the Browser Automation script:
   - `node ~/.openclaw/workspace/skills/x-browser/scripts/x-browser-post.mjs "[TEXT]"`
4. **Log**: Update `POSTING_QUEUE.json` with `status: "published"` and the timestamp.

## Constraints
- **Model**: `openai/gpt-5-nano` (Capped at 16 tokens).
- **Trigger**: Can be manual (`/publish`) or automated via Cron.
