# Financial Tracker - Netlify Deployment Guide

## Prerequisites
- GitHub account
- Netlify account (free tier works)
- Your code pushed to GitHub

## Step 1: Prepare Your Repository

1. **Create a `.gitignore` file** (if not exists) in the root:
   ```
   node_modules/
   .next/
   .env.local
   .DS_Store
   *.log
   .venv/
   __pycache__/
   *.db
   *.pyc
   ```

2. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

## Step 2: Deploy Frontend to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. Go to [netlify.com](https://www.netlify.com/) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `gowthamsai117/bolt`
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
   - **Branch to deploy**: `main`

6. Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

## Step 3: Configure Environment Variables

In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add these variables:
   - `NEXT_PUBLIC_API_BASE` = Your backend API URL (see Step 4)
   - `NODE_VERSION` = `18`

## Step 4: Deploy Backend

You have several options for the backend:

### Option A: Render.com (Free Tier)
1. Go to [render.com](https://render.com/)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Name**: financial-tracker-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `PORT` = `8000`
6. Deploy and copy the URL
7. Update Netlify env var `NEXT_PUBLIC_API_BASE` with this URL

### Option B: Railway.app
1. Go to [railway.app](https://railway.app/)
2. Create new project from GitHub repo
3. Select backend directory
4. It will auto-detect Python and deploy
5. Copy the provided URL
6. Update Netlify env var `NEXT_PUBLIC_API_BASE`

### Option C: Fly.io
1. Install flyctl: `https://fly.io/docs/hands-on/install-flyctl/`
2. Run: `fly launch` in backend directory
3. Follow prompts to deploy
4. Copy the app URL
5. Update Netlify env var `NEXT_PUBLIC_API_BASE`

## Step 5: Update CORS in Backend

Before deploying backend, update `backend/app/main.py`:

```python
# Update origins to include your Netlify URL
origins = [
    "http://localhost:3000",
    "https://your-netlify-site.netlify.app",  # Add your Netlify URL here
]
```

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Test adding transactions
3. Verify data persists (if backend is deployed)

## Environment Variables Summary

### Netlify (Frontend)
- `NEXT_PUBLIC_API_BASE` - Backend API URL (e.g., `https://your-api.onrender.com`)
- `NODE_VERSION` - `18`

### Backend Service
- `PORT` - Usually auto-set by platform
- `DATABASE_URL` - If using external database (optional)

## Troubleshooting

### Build Fails
- Check Node version is 18 or higher
- Ensure all dependencies are in package.json
- Check build logs in Netlify dashboard

### API Not Working
- Verify CORS settings in backend
- Check `NEXT_PUBLIC_API_BASE` is set correctly
- Ensure backend is deployed and running

### Database Issues
- For production, use PostgreSQL instead of SQLite
- Most platforms offer free PostgreSQL add-ons

## Quick Deploy Commands

```bash
# From root directory

# 1. Push to GitHub
git add .
git commit -m "Deploy to Netlify"
git push origin main

# 2. Deploy frontend via CLI
cd frontend
netlify deploy --prod

# 3. Build succeeds? You're live!
```

## Post-Deployment

1. Add custom domain (optional) in Netlify settings
2. Enable HTTPS (automatic with Netlify)
3. Set up continuous deployment (automatic from GitHub)
4. Monitor usage in Netlify dashboard

## Notes

- **Database**: SQLite doesn't work well on Netlify/serverless. For production:
  - Deploy backend separately (Render, Railway, Fly.io)
  - Use PostgreSQL or MongoDB for persistence
  
- **Free Tier Limits**:
  - Netlify: 100GB bandwidth/month
  - Render: 750 hours/month
  - Both sufficient for personal projects

- **Continuous Deployment**: Every push to your branch will auto-deploy

## Support

If deployment fails:
1. Check Netlify build logs
2. Verify Node version
3. Test local build: `npm run build`
4. Check environment variables are set
