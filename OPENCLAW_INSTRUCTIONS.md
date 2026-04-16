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
  ],
  "images": [
    "https://example.com/image-for-tweet-1.jpg",
    "",
    "https://example.com/image-for-tweet-3.jpg"
  ]
}
```

### Fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | String | ✅ | Internal name for management (not published) |
| `thread` | String[] | ✅ | Array of tweet strings, each ≤ 280 chars |
| `images` | String[] | ❌ | Array of image URLs, parallel to `thread`. Use `""` for tweets without images |

### Rules for Creating:
- Each tweet **MUST** be ≤ 280 characters
- Thread length: **3 to 8 tweets** (ideal: 5-6)
- `images` array should have the same length as `thread`
- Use empty string `""` for tweets that have no image
- If no images at all, you can omit the `images` field entirely
- Status is automatically set to `"review"`

### Response:
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "title": "Pharos Network Analysis Thread",
    "thread": ["...", "..."],
    "images": ["https://...", "", "https://..."],
    "status": "review",
    "version": 1,
    "comments": [],
    "createdAt": "2026-04-15T10:00:00.000Z"
  }
}
```

---

## 🖼️ 2. Image Hosting (Free & Easy)

To provide image URLs to Content Factory, you need to host your images on the web. The recommended free and easiest service is **ImgBB**.

### ImgBB API Setup:
1. **API Key**: The admin provides the ImgBB API key.
2. **Endpoint**: `https://api.imgbb.com/1/upload?key=YOUR_API_KEY`

### How to upload an image (Logic for OpenClaw):
- **Method**: `POST` (Multipart / Form-data)
- **Parameter**: `image` (can be a base64 string, a binary file, or a local path if using a helper)

**Example Request (Curl style):**
```bash
curl --location --request POST 'https://api.imgbb.com/1/upload?key=YOUR_API_KEY' \
--form 'image=R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
```

**Response (Relevant field):**
You must extract `data.url` from the response to use in the `images` array of Content Factory.

```json
{
  "data": {
    "url": "https://i.ibb.co/L5M4fHq/your-image.jpg",
    "display_url": "...",
    "delete_url": "..."
  },
  "success": true,
  "status": 200
}
```

### Full Automated Workflow for Images:
1. **Generate Image**: You create the image (using AI or local tools).
2. **Upload to ImgBB**: Call the ImgBB API to get a permanent public URL.
3. **Submit to Dashboard**: Include that URL in your `images` array when calling `POST /posts` or `PATCH /posts`.

---

## 🖼️ 3. Image Guidelines in Dashboard

## 🔄 3. Checking for Redo Requests

The admin may request a rewrite by marking a post as `"redo"`. You **must** poll for these periodically.

### Poll every 5-10 minutes:

```http
GET /posts?status=redo
```

### If posts are found, fetch full details:

```http
GET /posts/{postId}
```

---

## 💬 4. Reading Admin Feedback

The `comments` array contains the admin's feedback:

```json
{
  "comments": [
    {
      "text": "This sentence is too vague. Add specific numbers.",
      "selection": "the network is growing fast",
      "createdAt": "2026-04-15T10:15:00.000Z"
    },
    {
      "text": "Replace this image with a chart",
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
| `comment.selection` | The specific text the admin highlighted. If empty, it's a general comment |

### Critical Rules:
1. **Read ALL comments** — do not skip any
2. If `selection` is present → fix that specific part
3. If `selection` is empty → it's a general instruction
4. Comments persist across versions — you see the full history

---

## ✏️ 5. Rewriting and Resubmitting

After reading feedback, rewrite and submit:

```http
PATCH /posts/{postId}
Content-Type: application/json

{
  "thread": [
    "Rewritten tweet 1...",
    "Improved tweet 2 with specific numbers...",
    "Updated tweet 3..."
  ],
  "images": [
    "https://example.com/new-cover.jpg",
    "",
    "https://example.com/updated-chart.png"
  ],
  "status": "review"
}
```

### What happens:
- `version` automatically increments
- `status` changes from `"redo"` back to `"review"`
- All previous comments remain visible
- You can update both `thread` and `images` in the same request

---

## 🔁 6. Complete Workflow Loop

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   OpenClaw creates post                         │
│   POST /posts { title, thread, images }         │
│              ↓                                  │
│        status = "review"                        │
│              ↓                                  │
│   Admin reviews on Dashboard                    │
│   (Split View = tweets + images)                │
│   (Merge View = article + first image)          │
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
│ manually   { thread, images, status:"review" }  │
│   │              ↓                              │
│   ↓         Back to "review" ──→ (loop)         │
│ "published"                                     │
│ (tracking)                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📏 7. Content Quality Rules

### Character Limits
- Each tweet: **maximum 280 characters**
- Thread length: **3–8 tweets** (sweet spot: 5–6)

### Writing Style
- Start with a strong hook (tweet 1)
- Build narrative across tweets
- End with a clear CTA or takeaway
- Use line breaks within tweets for readability

### Image Best Practices
- Include a cover image on the first tweet when possible
- Use charts/infographics for data-heavy tweets
- Don't attach images to every tweet — only where they add value
- Use high-resolution images (min 800px width)

### On Rewrite
- Address **every** comment from the admin
- If a `selection` was highlighted → rewrite that specific part
- Maintain the original message intent while improving quality
- You may also update images if the admin requests it

---

## 🚫 8. What NOT to Do

- ❌ Do NOT seek for a "push-to-frontend" or `/api/push_to_fe` endpoint. It does not exist.
- ❌ Do NOT auto-post to X/Twitter — publishing is manual only
- ❌ Do NOT set status to anything other than `"review"` when creating or resubmitting
- ❌ Do NOT exceed 280 characters per tweet
- ❌ Do NOT ignore comments
- ❌ Do NOT use temporary/expiring image URLs

---

## 🔑 Quick Reference

| Action | Method | Endpoint | Body | Status After |
|---|---|---|---|---|
| Create post | `POST` | `/posts` | `{ title, thread, images }` | `review` |
| Check for redo | `GET` | `/posts?status=redo` | — | — |
| Read post | `GET` | `/posts/:id` | — | — |
| Resubmit | `PATCH` | `/posts/:id` | `{ thread, images, status:"review" }` | `review` |

---

## 📊 9. Dashboard View Modes (Admin Side)

The admin can toggle between two views:

| Mode | Behavior |
|---|---|
| **Split** | Each tweet displayed individually with its own image. Copy button per tweet. |
| **Merge** | All tweets merged into one article. Only the **first image** is shown as the cover. Copy All button. |

Both views support:
- Text highlighting → inline comments
- Copy text to clipboard (per tweet or entire article)
- Download images
