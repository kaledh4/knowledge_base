# Quick Setup Checklist ✅

## Step 1: GitHub Secrets Configuration
- [ ] Go to `https://github.com/kaledh4/knowledge_base` → Settings → Secrets and variables → Actions
- [ ] Add **7 Backend Secrets**: `APPWRITE_ENDPOINT` → `https://fra.cloud.appwrite.io/v1`, `APPWRITE_PROJECT_ID` → `68d3ae0a0029bcf8d185`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPWRITE_COLLECTION_ID`, `APPWRITE_EMAIL`, `APPWRITE_PASSWORD`
- [ ] Add **6 Frontend Secrets**: `VITE_APPWRITE_ENDPOINT` → `https://fra.cloud.appwrite.io/v1`, `VITE_APPWRITE_PROJECT_ID` → `68d3ae0a0029bcf8d185`, and other `VITE_*` variables (database ID, collection ID, function IDs)

## Step 2: Appwrite Project Setup
- [ ] Create account at [Appwrite Cloud](https://fra.cloud.appwrite.io)
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
- **Appwrite Console**: https://fra.cloud.appwrite.io
- **Local Development**: http://localhost:3000

## Need Help?
- 📖 Detailed guide: `SETUP_GUIDE.md`
- 🚀 Deployment guide: `DEPLOYMENT.md`
- 📋 Main documentation: `README.md`

---
**Status**: Ready for deployment! 🚀