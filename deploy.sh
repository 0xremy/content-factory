#!/bin/bash

# PROFESUI Deployment Script
# This script facilitates the deployment of the backend (Render) and frontend (Vercel).

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting PROFESUI Deployment...${NC}"

# --- Backend Deployment (Render) ---
echo -e "\n${BLUE}📦 Deploying Backend to Render...${NC}"
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ RENDER_API_KEY not found in environment.${NC}"
    echo -e "To deploy the backend, please follow these steps:"
    echo -e "1. Push your code to GitHub."
    echo -e "2. Go to https://dashboard.render.com and create a new 'Web Service'."
    echo -e "3. Connect your repository and set the root directory to 'backend'."
    echo -e "4. Add the environment variables from .env.example to the Render dashboard."
else
    echo -e "${GREEN}✅ RENDER_API_KEY found. Attempting CLI deployment...${NC}"
    # Assuming render-cli is installed
    if command -v render &> /dev/null; then
        render deploy backend
    else
        echo -e "${RED}❌ render-cli not installed. Please use the Render Dashboard for deployment.${NC}"
    fi
fi

# --- Frontend Deployment (Vercel) ---
echo -e "\n${BLUE}📦 Deploying Frontend to Vercel...${NC}"
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ VERCEL_TOKEN not found in environment.${NC}"
    echo -e "To deploy the frontend, please run the following commands:"
    echo -e "1. npm install -g vercel"
    echo -e "2. cd frontend && vercel login"
    echo -e "3. vercel deploy --prod"
else
    echo -e "${GREEN}✅ VERCEL_TOKEN found. Attempting CLI deployment...${NC}"
    # Assuming vercel cli is installed
    if command -v vercel &> /dev/null; then
        cd frontend && vercel deploy --prod --token $VERCEL_TOKEN
        cd ..
    else
        echo -e "${RED}❌ Vercel CLI not installed. Please install it via 'npm install -g vercel'.${NC}"
    fi
fi

echo -e "\n${BLUE}🏁 Deployment process completed.${NC}"
