# Fallback Web Search khi X API bị limit

## Tình huống
X (Twitter) API bị rate limit hoặc hết quota → cần fallback sang web search.

## Giải pháp

### 1. Dùng OpenClaw built-in tool `web_search`
```bash
# Tool có sẵn, dùng Gemini search
web_search(query)
```

### 2. Dùng skill `claudecode-websearch`
```bash
# Cần cài Claude Code CLI hoặc Codex CLI
scripts/websearch.sh "query"

# Hoặc dùng alias
ccws "query"
```

### 3. Dùng skill `x-search` (xAI API)
```bash
# Cần XAI_API_KEY
python3 scripts/search.py "query"
```

### 4. Manual web search + fetch
```bash
web_fetch(url) # Fetch trang web
```

## Flow fallback

1. Thử X API (x-api skill)
2. Nếu fail (rate limit, 402, 429):
   - Ghi log "X API limit, falling back to web search"
   - Dùng `web_search` với cùng query
   - Hoặc dùng `claudecode-websearch` nếu đã cài CLI

## Cài đặt cần thiết

```bash
# Cài Claude Code CLI (cho claudecode-websearch)
npm install -g @anthropic-ai/claude-code

# Cài alias
ln -sf /home/profesor/.openclaw/workspace/skills/claudecode-websearch/scripts/websearch.sh ~/.local/bin/ccws
```

## Notes
- `web_search` dùng Gemini, free nhưng có limit
- `claudecode-websearch` free, dùng Claude/Codex CLI
- Ưu tiên: x-api → claudecode-websearch → web_search