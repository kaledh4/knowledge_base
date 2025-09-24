# Secure GitHub to Appwrite Deployment Guide

## ⚠️ Security Best Practices

**NEVER commit sensitive information to your repository!** This guide shows you how to deploy securely using GitHub Secrets and environment variables.

## Method 1: Direct Appwrite GitHub Integration (Recommended)

### Step 1: Connect GitHub to Appwrite

1. Go to your Appwrite Console → Settings → Git configuration
2. Click "Connect to GitHub"
3. Authorize Appwrite to access your repository
4. Select your `knowledge_base` repository

### Step 2: Configure Auto-Deployment

1. In Appwrite Console → Functions
2. Create functions with GitHub integration:
   - **Scrape Function**: Connect to `functions/scrape` folder
   - **MCP Function**: Connect to `functions/mcp` folder
3. Enable auto-deployment on push to `master` branch

### Step 3: Set Environment Variables in Appwrite

In Appwrite Console → Settings → Global variables, add:

```
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_COLLECTION_ID=your-collection-id
APPWRITE_EMAIL=your-email
APPWRITE_PASSWORD=your-password
```

## Method 2: GitHub Actions with Secrets (Advanced)

### Step 1: Configure GitHub Secrets

Go to `https://github.com/YOUR_USERNAME/knowledge_base` → Settings → Secrets and variables → Actions

Add these secrets (get values from your Appwrite Console):

**Backend Secrets:**
- `APPWRITE_ENDPOINT` → Your Appwrite endpoint
- `APPWRITE_PROJECT_ID` → Your project ID
- `APPWRITE_API_KEY` → Generate in Appwrite Console
- `APPWRITE_DATABASE_ID` → Create database first
- `APPWRITE_COLLECTION_ID` → Create collection first
- `APPWRITE_EMAIL` → Your login email
- `APPWRITE_PASSWORD` → Your login password

**Frontend Secrets:**
- `VITE_APPWRITE_ENDPOINT` → Same as APPWRITE_ENDPOINT
- `VITE_APPWRITE_PROJECT_ID` → Same as APPWRITE_PROJECT_ID
- `VITE_APPWRITE_DATABASE_ID` → Same as APPWRITE_DATABASE_ID
- `VITE_APPWRITE_COLLECTION_ID` → Same as APPWRITE_COLLECTION_ID
- `VITE_APPWRITE_SCRAPE_FUNCTION_ID` → Function ID after deployment
- `VITE_APPWRITE_MCP_FUNCTION_ID` → Function ID after deployment

### Step 2: Enable GitHub Actions

1. Go to your repository → Actions tab
2. Enable workflows if prompted
3. The workflows will automatically run on push to `master`

## Method 3: Local Development Setup

### Step 1: Create Local Environment File

Create `.env.local` (this file is gitignored for security):

```bash
# Copy this template and fill with your actual values
# NEVER commit this file to git!

VITE_APPWRITE_ENDPOINT=your-endpoint-here
VITE_APPWRITE_PROJECT_ID=your-project-id-here
VITE_APPWRITE_DATABASE_ID=your-database-id-here
VITE_APPWRITE_COLLECTION_ID=your-collection-id-here
VITE_APPWRITE_SCRAPE_FUNCTION_ID=your-scrape-function-id
VITE_APPWRITE_MCP_FUNCTION_ID=your-mcp-function-id
```

### Step 2: Run Development Server

```bash
npm install
npm run dev
```

## Security Checklist

- [ ] ✅ All sensitive data is in GitHub Secrets or environment variables
- [ ] ✅ No API keys or project IDs in committed code
- [ ] ✅ `.env.local` is in `.gitignore`
- [ ] ✅ Production environment uses secure deployment method
- [ ] ✅ API keys have minimal required permissions

## Troubleshooting

### GitHub Actions Failing?
1. Check that all required secrets are set
2. Verify secret names match exactly (case-sensitive)
3. Ensure Appwrite API key has sufficient permissions

### Functions Not Deploying?
1. Check function runtime matches `appwrite.json`
2. Verify environment variables are set in Appwrite Console
3. Check function logs in Appwrite Console

### Frontend Not Connecting?
1. Verify all `VITE_*` environment variables are set
2. Check browser console for connection errors
3. Ensure Appwrite project allows your domain

## Next Steps

1. Choose your preferred deployment method
2. Set up your Appwrite project (databases, collections)
3. Configure secrets/environment variables
4. Test the deployment
5. Monitor logs and performance

---

**Remember**: Security is paramount. Never expose sensitive credentials in your code or documentation!