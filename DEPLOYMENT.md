# Deployment Guide - GitHub to Appwrite

This guide covers deploying the Knowledge Base RAG system from GitHub to Appwrite.

## Prerequisites

- GitHub account with access to `kaledh4/knowledge_base`
- Appwrite Cloud account or self-hosted instance
- Basic understanding of Appwrite Console

## Method 1: Automated GitHub Actions Deployment

### Step 1: Fork or Clone Repository

```bash
git clone https://github.com/kaledh4/knowledge_base.git
cd knowledge_base
```

### Step 2: Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and Variables > Actions, and add:

#### Required Secrets:
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_COLLECTION_ID=your-collection-id
APPWRITE_EMAIL=your-appwrite-email
APPWRITE_PASSWORD=your-appwrite-password

# Frontend Environment Variables
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_COLLECTION_ID=your-collection-id
VITE_APPWRITE_SCRAPE_FUNCTION_ID=scrape-function
VITE_APPWRITE_MCP_FUNCTION_ID=mcp-server
```

### Step 3: Enable GitHub Actions

1. Push changes to trigger the workflow:
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin master
   ```

2. Monitor deployment in GitHub Actions tab

## Method 2: Direct Appwrite Console Integration

### Step 1: Create Appwrite Project

1. Login to [Appwrite Console](https://cloud.appwrite.io)
2. Create new project
3. Note down Project ID

### Step 2: Setup Database

1. Go to Databases > Create Database
2. Name: `clips-db`
3. Create Collection: `clips`
4. Add attributes:
   - `url` (String, 2048 chars)
   - `title` (String, 255 chars)
   - `content` (String, 65535 chars)
   - `metadata` (String, 2048 chars)
   - `userId` (String, 36 chars)
   - `createdAt` (DateTime)

### Step 3: Deploy Functions via Git

#### Scrape Function:
1. Functions > Create Function
2. Select "Git Repository"
3. Repository: `https://github.com/kaledh4/knowledge_base`
4. Branch: `master`
5. Root Directory: `functions/scrape`
6. Entry Point: `src/main.js`
7. Runtime: `Node.js 18.0`
8. Build Commands:
   ```
   npm install
   apt-get update && apt-get install -y python3 python3-pip
   pip3 install trafilatura yt-dlp
   ```

#### MCP Server Function:
1. Functions > Create Function
2. Select "Git Repository"
3. Repository: `https://github.com/kaledh4/knowledge_base`
4. Branch: `master`
5. Root Directory: `functions/mcp`
6. Entry Point: `src/main.js`
7. Runtime: `Node.js 18.0`
8. Build Commands: `npm install`

### Step 4: Configure Environment Variables

For both functions, add these variables in Function Settings:

```
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=clips-db-id
APPWRITE_COLLECTION_ID=clips-collection-id
```

### Step 5: Deploy Frontend

#### Option A: Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Option B: Netlify
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `out`
4. Set environment variables

#### Option C: GitHub Pages
1. Enable GitHub Pages in repository settings
2. Use GitHub Actions workflow (already configured)
3. Set custom domain if needed

## Method 3: Manual CLI Deployment

### Step 1: Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### Step 2: Login and Initialize

```bash
appwrite login
appwrite init project
```

### Step 3: Deploy Functions

```bash
# Deploy scrape function
cd functions/scrape
appwrite deploy function

# Deploy MCP function
cd ../mcp
appwrite deploy function
```

### Step 4: Setup Database

```bash
node deploy.js
```

## Environment Configuration

### Local Development
Create `.env.local`:
```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_COLLECTION_ID=your-collection-id
VITE_APPWRITE_SCRAPE_FUNCTION_ID=your-scrape-function-id
VITE_APPWRITE_MCP_FUNCTION_ID=your-mcp-function-id
```

### Production
Set the same variables in your hosting platform's environment settings.

## Verification

1. **Test Functions:**
   - Go to Appwrite Console > Functions
   - Execute test runs for both functions
   - Check logs for errors

2. **Test Frontend:**
   - Visit deployed URL
   - Try creating a clip
   - Verify database updates

3. **Test MCP Integration:**
   - Use MCP client to connect
   - Test available tools and resources

## Troubleshooting

### Common Issues:

1. **Function Build Fails:**
   - Check build commands in function settings
   - Verify Python dependencies installation
   - Check function logs

2. **Database Connection Issues:**
   - Verify API key permissions
   - Check database and collection IDs
   - Ensure proper attribute configuration

3. **Frontend Build Fails:**
   - Check environment variables
   - Verify all required secrets are set
   - Check build logs in GitHub Actions

4. **CORS Issues:**
   - Add your domain to Appwrite project settings
   - Configure proper origins in Appwrite Console

## Monitoring

- **Appwrite Console:** Monitor function executions and database operations
- **GitHub Actions:** Track deployment status and logs
- **Hosting Platform:** Monitor frontend performance and errors

## Updates and Maintenance

1. **Code Updates:**
   - Push to GitHub repository
   - GitHub Actions will automatically deploy
   - Monitor deployment status

2. **Function Updates:**
   - Functions will auto-deploy from Git
   - Check function logs after updates
   - Test functionality after deployment

3. **Database Schema Changes:**
   - Update via Appwrite Console
   - Or use migration scripts in `deploy.js`

For additional support, refer to:
- [Appwrite Documentation](https://appwrite.io/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Project Issues](https://github.com/kaledh4/knowledge_base/issues)