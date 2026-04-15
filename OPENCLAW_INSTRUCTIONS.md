# OpenClaw Content Agent — Integration Guide

> This document defines the API contract and behavioral rules for OpenClaw to interact with the Content Operations Dashboard.

## 🌐 API Base URL

```
https://content-factory-68ch.onrender.com/api
```

---

## 📝 1. Creating New Content

When you have new content ready for review, create a post:

```http
POST /posts
Content-Type: application/json

{
  "title": "Internal title for tracking (not published)",
  "thread": [
    "First tweet of the thread. Keep under 280 characters.",
    "Second tweet continues the narrative...",
    "Third tweet wraps up with a CTA or insight."
  ]
}
```

### Rules for Creating:
- `title` — Short, descriptive name for internal management (e.g., "Pharos Network Analysis Thread")
- `thread` — Array of strings, each one is a single tweet
- Each tweet **MUST** be ≤ 280 characters
- Thread length: **3 to 8 tweets** (ideal: 5-6)
- Status is automatically set to `"review"` — the admin will see it on the dashboard

### Response:
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "title": "Pharos Network Analysis Thread",
    "thread": ["...", "..."],
    "status": "review",
    "version": 1,
    "comments": [],
    "createdAt": "2026-04-15T10:00:00.000Z"
  }
}
```

---

## 🔄 2. Checking for Redo Requests

The admin may request a rewrite by marking a post as `"redo"`. You **must** poll for these periodically.

### Poll every 5-10 minutes:

```http
GET /posts?status=redo
```

### Response (when redo posts exist):
```json
{
  "success": true,
  "data": [
    {
      "_id": "664a1b2c3d4e5f6a7b8c9d0e",
      "title": "Pharos Network Analysis Thread",
      "status": "redo",
      "version": 1,
      "comments": [...]
    }
  ]
}
```

### If posts are found, fetch full details:

```http
GET /posts/664a1b2c3d4e5f6a7b8c9d0e
```

---

## 💬 3. Reading Admin Feedback

The `comments` array contains the admin's feedback. Each comment has:

```json
{
  "comments": [
    {
      "text": "This sentence is too vague. Add specific numbers.",
      "selection": "the network is growing fast",
      "createdAt": "2026-04-15T10:15:00.000Z"
    },
    {
      "text": "Good hook but make it more urgent",
      "selection": "",
      "createdAt": "2026-04-15T10:16:00.000Z"
    }
  ]
}
```

### How to interpret:

| Field | Meaning |
|---|---|
| `comment.text` | The admin's instruction — what they want changed |
| `comment.selection` | The specific text the admin highlighted in the thread. If empty, it's a general comment |
| `comment.createdAt` | When the comment was made |

### Critical Rules:
1. **Read ALL comments** — do not skip any
2. If `selection` is present → the admin highlighted that exact text → **fix that specific part**
3. If `selection` is empty → it's a general instruction → apply it to the overall thread
4. Comments are **never deleted** — they persist across versions so you can see the full history

---

## ✏️ 4. Rewriting and Resubmitting

After reading the feedback, rewrite the thread and submit:

```http
PATCH /posts/664a1b2c3d4e5f6a7b8c9d0e
Content-Type: application/json

{
  "thread": [
    "Rewritten tweet 1 addressing the feedback...",
    "Improved tweet 2 with specific numbers...",
    "Updated tweet 3 with stronger CTA..."
  ],
  "status": "review"
}
```

### What happens:
- `version` automatically increments (1 → 2 → 3...)
- `status` changes from `"redo"` back to `"review"`
- The admin sees the updated version on dashboard
- All previous comments remain visible
- The admin may approve, request another redo, or reject

---

## 🔁 5. Complete Workflow Loop

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   OpenClaw creates post                         │
│   POST /posts { title, thread }                 │
│              ↓                                  │
│        status = "review"                        │
│              ↓                                  │
│   Admin reviews on Dashboard                    │
│              ↓                                  │
│   ┌─────────┼──────────┐                        │
│   │         │          │                        │
│ APPROVE   REDO      REJECT                      │
│   │         │          │                        │
│   ↓         ↓          ↓                        │
│ "approved" "redo"   "rejected"                  │
│   │         │       (end)                       │
│   ↓         ↓                                   │
│ Admin      OpenClaw reads                       │
│ posts      comments & rewrites                  │
│ to X       PATCH /posts/:id                     │
│ manually   { thread, status:"review" }          │
│   │              ↓                              │
│   ↓         Back to "review" ──→ (loop)         │
│ "published"                                     │
│ (tracking)                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📏 6. Content Quality Rules

### Character Limits
- Each tweet: **maximum 280 characters**
- Thread length: **3–8 tweets** (sweet spot: 5–6)

### Writing Style
- Be engaging and professional
- Start with a strong hook (tweet 1)
- Build narrative across tweets
- End with a clear CTA or takeaway
- Use line breaks within tweets for readability
- Avoid filler phrases — every word should earn its place

### On Rewrite
- Address **every** comment from the admin
- If a `selection` was highlighted → rewrite that specific part
- Do not remove content unless explicitly asked
- Maintain the original message intent while improving quality
- Increment quality — each version should be noticeably better

---

## 🚫 7. What NOT to Do

- ❌ Do NOT auto-post to X/Twitter — publishing is manual only
- ❌ Do NOT set status to anything other than `"review"` when creating or resubmitting
- ❌ Do NOT exceed 280 characters per tweet
- ❌ Do NOT ignore comments — the admin sees if feedback was addressed
- ❌ Do NOT delete or modify comments — they are read-only for you

---

## 📊 8. Monitoring (Optional)

You can also check the status of your posts:

```http
# All your posts
GET /posts

# Filter by status
GET /posts?status=review
GET /posts?status=approved
GET /posts?status=published

# Search by keyword
GET /posts?search=pharos
```

---

## 🔑 Quick Reference

| Action | Method | Endpoint | Status After |
|---|---|---|---|
| Create post | `POST` | `/posts` | `review` |
| Check for redo | `GET` | `/posts?status=redo` | — |
| Read post details | `GET` | `/posts/:id` | — |
| Resubmit rewrite | `PATCH` | `/posts/:id` | `review` |
