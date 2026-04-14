# 🚀 Deployment Guide: X-Content Management System (X-CMS)

This guide provides step-by-step instructions to deploy the X-CMS Command Center to a production environment.

## 🛠 Tech Stack
- **Frontend**: ReactJS + Tailwind CSS $\rightarrow$ [Vercel](https://vercel.com)
- **Backend**: NodeJS + Express $\rightarrow$ [Render](https://render.com)
- **Database**: MongoDB $\rightarrow$ [MongoDB Atlas](https://mongodb.com/cloud/atlas)

---

## 1. Database Setup (MongoDB Atlas)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Cluster** (Shared/Free tier).
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) to permit Render.com to connect.
4. In **Database Access**, create a user with a strong password.
5. Click **Connect** $\rightarrow$ **Connect your application** and copy the `MONGODB_URI`.

---

## 2. Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repo and select the `backend` folder as the root directory (if using a monorepo).
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. **Environment Variables**: Add the following in the Render Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `X_CONSUMER_KEY`: Your X API Consumer Key.
   - `X_CONSUMER_SECRET`: Your X API Consumer Secret.
   - `X_ACCESS_TOKEN`: Your X API Access Token.
   - `X_ACCESS_TOKEN_SECRET`: Your X API Access Token Secret.
   - `PORT`: `10000` (Render's default)

---

## 3. Frontend Deployment (Vercel)
1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. Select the `frontend` folder as the root directory.
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Environment Variables**:
   - `REACT_APP_API_URL`: The URL of your deployed Render backend (e.g., `https://x-cms-backend.onrender.com/api`).

---

## 🧪 End-to-End (E2E) Testing Checklist

Perform the following flow to verify the system is fully operational:

### ✅ Stage 1: Ingestion
- [ ] Send a `POST` request to `/api/posts/ingest` with a thread (array of content).
- [ ] Verify the post appears in the **Content Queue** as `draft`.

### ✅ Stage 2: Review
- [ ] Click the **Eye (Preview)** icon on the post.
- [ ] Verify the **Thread Preview** displays the posts in sequential order.
- [ ] Test responsiveness by opening the preview on a mobile device.

### ✅ Stage 3: Publishing
- [ ] Click **Publish Now** in the Queue or **Publish Thread** in the Preview.
- [ ] Verify the backend returns a `202 Accepted` response.
- [ ] Check the X account to confirm the thread was posted correctly.

### ✅ Stage 4: Tracking
- [ ] Once published, navigate to the **Analytics** view for that post.
- [ ] Verify that **Impressions**, **Likes**, **Retweets**, and **Replies** are being fetched and displayed correctly from the X API.

---

## 🛠 Future Modules Slots
The modular shell is designed to support the following upcoming additions:
- **Agent Manager**: Integration with OpenClaw agents for AI-generated content.
- **Cron Job Monitor**: Visibility into scheduled publishing tasks.
- **Narrative Planner**: A visual canvas for mapping out content arcs.
