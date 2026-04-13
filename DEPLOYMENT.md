# 🚀 Deployment Guide: PROFESUI

This guide provides the actual steps to take the PROFESUI Command Center live.

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
5. Click **Connect** $\rightarrow$ **Connect your application** and copy the `MONGODB_URI`. Update the `.env` file in the `backend` folder with this URI (ensure the database name is `profesui`).

---

## 2. Backend Deployment (Render)
The backend is designed to be hosted on Render.

### 🚀 Quick Deploy (Recommended)
1. Push the `profesui` folder to a GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repo and set the root directory to `backend`.
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. **Environment Variables**: Use the keys from `backend/.env` and enter your actual X API keys and MongoDB URI in the Render Dashboard.

### 💻 CLI Deploy
If you have the `render-cli` installed and a `RENDER_API_KEY` set in your environment, you can run:
```bash
./deploy.sh
```

---

## 3. Frontend Deployment (Vercel)
The frontend is optimized for Vercel.

### 🚀 Quick Deploy (Recommended)
1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. Select the `frontend` folder as the root directory.
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Environment Variables**: 
   - `REACT_APP_API_URL`: Use the URL of your deployed Render backend (e.g., `https://profesui-backend.onrender.com/api`).

### 💻 CLI Deploy
If you have the Vercel CLI installed and a `VERCEL_TOKEN` set in your environment, you can run:
```bash
./deploy.sh
```

---

## 🛠 Deployment Script (`deploy.sh`)
A helper script `deploy.sh` has been provided in the root directory. It attempts to deploy using CLI tools if tokens are present in your environment. Otherwise, it provides the exact manual steps required to go live.

**To use it:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 End-to-End (E2E) Testing Checklist
Verify the system is operational:
- [ ] **Ingestion**: Send a POST to `/api/posts/ingest` $\rightarrow$ Verify in Queue.
- [ ] **Review**: Check the **Thread Preview** for sequential order.
- [ ] **Publishing**: Click **Publish Now** $\rightarrow$ Verify post on X.
- [ ] **Tracking**: Check **Analytics** $\rightarrow$ Verify real-time metrics.
