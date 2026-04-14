# Technical Plan: Content Factory Web App

## 1. Overview
The Content Factory Web App is a MERN-stack application designed to manage, review, and publish dual-language (English/Vietnamese) content to X, while tracking performance metrics.

## 2. Tech Stack
- **Frontend**: React.js (with Vite), Tailwind CSS (for UX/UI), Axios (for API calls).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Integration**: X API (for publishing and metrics).

## 3. Database Schema (MongoDB)
**Collection: `Posts`**
- `title`: String (Internal reference)
- `content_en`: String (English version)
- `content_vi`: String (Vietnamese version)
- `status`: Enum (`'draft'`, `'reviewed'`, `'published'`)
- `source`: String (e.g., `'TOKYO'`)
- `published_at`: Date (optional)
- `x_post_id`: String (ID from X API)
- `metrics`:
    - `impressions`: Number
    - `likes`: Number
    - `comments`: Number
- `created_at`: Date
- `updated_at`: Date

## 4. API Endpoints (Backend)
### Posts
- `GET /api/posts` - Fetch all posts (with filters for status).
- `GET /api/posts/:id` - Fetch a single post.
- `POST /api/posts` - Create a new post.
- `PUT /api/posts/:id` - Update post content or status.
- `DELETE /api/posts/:id` - Remove a post.

### Publishing & Metrics
- `POST /api/posts/:id/publish` - Trigger publication to X API.
- `POST /api/posts/:id/sync-metrics` - Manually trigger metrics update from X API.
- `GET /api/metrics/summary` - Aggregate metrics for the dashboard.

## 5. Frontend Architecture
### Pages
- **Dashboard**: High-level overview of total posts, total impressions, likes, and comments.
- **Review Queue**: List of posts from 'TOKYO' awaiting review. Allows editing and triggering the "Publish" action.
- **Content Manager**: Full list of posts for editing, archiving, and historical view.
- **Post Detail**: Detailed view of a single post with its dual-language content and specific metrics.

### UX/UI Goals
- **Minimalism**: Clean interface, high contrast, easy to read.
- **Efficiency**: One-click publishing, quick toggles between English/Vietnamese views.
- **Visual Feedback**: Clear status indicators (e.g., Green for Published, Yellow for Review).

## 6. Implementation Roadmap
1. **Phase 1: Backend Foundation**
   - Setup Express server and MongoDB connection.
   - Implement Post model and basic CRUD APIs.
2. **Phase 2: Frontend Foundation**
   - Setup React app with Tailwind CSS.
   - Implement basic API integration and Post listing.
3. **Phase 3: Publishing & Metrics**
   - Integrate X API for posting.
   - Implement metrics fetching and updating logic.
4. **Phase 4: UX Refinement**
   - Build the Review Queue and Metrics Dashboard.
   - Final polish for PROFESOR's user experience.
