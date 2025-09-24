# Quick Setup Checklist ✅

## Step 1: GitHub Secrets Configuration
- [ ] Go to `https://github.com/kaledh4/knowledge_base` → Settings → Secrets and variables → Actions
- [ ] Add `APPWRITE_ENDPOINT` (https://cloud.appwrite.io/v1)
- [ ] Add `APPWRITE_PROJECT_ID` (from Appwrite Console)
- [ ] Add `APPWRITE_API_KEY` (from Appwrite Console)
- [ ] Add `APPWRITE_DATABASE_ID` (from Appwrite Console)
- [ ] Add `APPWRITE_COLLECTION_ID` (from Appwrite Console)
- [ ] Add `APPWRITE_EMAIL` (your Appwrite account email)
- [ ] Add `APPWRITE_PASSWORD` (your Appwrite account password)
- [ ] Add all `VITE_*` frontend environment variables

## Step 2: Appwrite Project Setup
- [ ] Create account at [Appwrite Cloud](https://cloud.appwrite.io)
- [ ] Create new project: "Knowledge Base RAG"
- [ ] Generate API Key with full permissions
- [ ] Create database: `clips-db`
- [ ] Create collection: `clips`
- [ ] Add required attributes:
  - [ ] `url` (String, 2048)
  - [ ] `title` (String, 255)
  - [ ] `content` (String, 65535)
  - [ ] `metadata` (String, 2048)
  - [ ] `userId` (String, 36)
  - [ ] `createdAt` (DateTime)
- [ ] Configure collection permissions for authenticated users

## Step 3: Enable GitHub Actions
- [ ] Verify all secrets are added correctly
- [ ] Go to Actions tab and enable workflows
- [ ] Make a test commit to trigger deployment:
  ```bash
  echo "# Test" >> README.md
  git add README.md
  git commit -m "Test deployment"
  git push origin master
  ```
- [ ] Monitor deployment in Actions tab
- [ ] Check for successful completion

## Step 4: Test Integration
- [ ] Test scrape function in Appwrite Console
- [ ] Test MCP function in Appwrite Console
- [ ] Create `.env.local` for local testing
- [ ] Run `npm run dev` and test frontend locally
- [ ] Test deployed application
- [ ] Verify end-to-end functionality:
  - [ ] Submit URL for scraping
  - [ ] Check content appears in database
  - [ ] Test search functionality
  - [ ] Verify MCP server responds

## Quick Commands

### Local Development:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test scraping function
npm run test-scrape

# Test MCP server
npm run test-mcp
```

### Deployment:
```bash
# Deploy to Appwrite
npm run deploy

# Setup Appwrite project
npm run setup
```

## Important URLs
- **Repository**: https://github.com/kaledh4/knowledge_base
- **Appwrite Console**: https://cloud.appwrite.io
- **Local Development**: http://localhost:3000

## Need Help?
- 📖 Detailed guide: `SETUP_GUIDE.md`
- 🚀 Deployment guide: `DEPLOYMENT.md`
- 📋 Main documentation: `README.md`

---
**Status**: Ready for deployment! 🚀