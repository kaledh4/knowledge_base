# Step-by-Step Setup Guide: GitHub to Appwrite Deployment

This guide will walk you through the complete setup process for deploying your RAG Knowledge Base from GitHub to Appwrite.

## Step 1: Configure GitHub Secrets

### 1.1 Access Repository Settings
1. Go to your GitHub repository: `https://github.com/kaledh4/knowledge_base`
2. Click on **Settings** tab (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### 1.2 Add Required Secrets
Click **New repository secret** for each of the following:

#### Core Appwrite Secrets:
```
Name: APPWRITE_ENDPOINT
Value: https://cloud.appwrite.io/v1
(or your self-hosted URL like https://your-domain.com/v1)

Name: APPWRITE_PROJECT_ID
Value: [Your Appwrite Project ID - get this from Step 2]

Name: APPWRITE_API_KEY
Value: [Your Appwrite API Key - get this from Step 2]

Name: APPWRITE_DATABASE_ID
Value: [Your Database ID - get this from Step 2]

Name: APPWRITE_COLLECTION_ID
Value: [Your Collection ID - get this from Step 2]

Name: APPWRITE_EMAIL
Value: [Your Appwrite account email]

Name: APPWRITE_PASSWORD
Value: [Your Appwrite account password]
```

#### Frontend Environment Secrets:
```
Name: VITE_APPWRITE_ENDPOINT
Value: https://cloud.appwrite.io/v1

Name: VITE_APPWRITE_PROJECT_ID
Value: [Same as APPWRITE_PROJECT_ID]

Name: VITE_APPWRITE_DATABASE_ID
Value: [Same as APPWRITE_DATABASE_ID]

Name: VITE_APPWRITE_COLLECTION_ID
Value: [Same as APPWRITE_COLLECTION_ID]

Name: VITE_APPWRITE_SCRAPE_FUNCTION_ID
Value: scrape-function

Name: VITE_APPWRITE_MCP_FUNCTION_ID
Value: mcp-server
```

---

## Step 2: Setup Appwrite Project

### 2.1 Create Appwrite Account & Project
1. Go to [Appwrite Cloud](https://cloud.appwrite.io) or your self-hosted instance
2. Sign up/Login with your account
3. Click **Create Project**
4. Enter project name: `Knowledge Base RAG`
5. **Copy the Project ID** - you'll need this for GitHub secrets

### 2.2 Generate API Key
1. In your project dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `GitHub Actions Deploy`
4. Scopes: Select **All** or at minimum:
   - `databases.read`, `databases.write`
   - `collections.read`, `collections.write`
   - `documents.read`, `documents.write`
   - `functions.read`, `functions.write`
5. **Copy the API Key** - add this to GitHub secrets

### 2.3 Create Database
1. Go to **Databases** in left sidebar
2. Click **Create Database**
3. Database ID: `clips-db` (or custom name)
4. Name: `Clips Database`
5. **Copy the Database ID** - add this to GitHub secrets

### 2.4 Create Collection
1. Inside your database, click **Create Collection**
2. Collection ID: `clips` (or custom name)
3. Name: `Clips Collection`
4. **Copy the Collection ID** - add this to GitHub secrets

### 2.5 Configure Collection Attributes
Add these attributes to your collection:

```
1. Attribute Key: url
   Type: String
   Size: 2048
   Required: Yes

2. Attribute Key: title
   Type: String
   Size: 255
   Required: Yes

3. Attribute Key: content
   Type: String
   Size: 65535
   Required: Yes

4. Attribute Key: metadata
   Type: String
   Size: 2048
   Required: No

5. Attribute Key: userId
   Type: String
   Size: 36
   Required: Yes

6. Attribute Key: createdAt
   Type: DateTime
   Required: Yes
```

### 2.6 Configure Permissions
1. In your collection, go to **Settings** → **Permissions**
2. Add these permissions:
   - **Create**: `users` (authenticated users can create)
   - **Read**: `users` (authenticated users can read)
   - **Update**: `users` (authenticated users can update their own)
   - **Delete**: `users` (authenticated users can delete their own)

### 2.7 Enable Authentication (Optional)
1. Go to **Auth** in left sidebar
2. Enable desired authentication methods:
   - **Email/Password**
   - **OAuth providers** (Google, GitHub, etc.)
3. Configure redirect URLs if using OAuth

---

## Step 3: Enable GitHub Actions

### 3.1 Verify Secrets Configuration
1. Go back to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Verify all secrets from Step 1 are added correctly
4. **Important**: Make sure there are no typos in secret names

### 3.2 Enable GitHub Actions
1. Go to **Actions** tab in your repository
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. You should see two workflows:
   - `Deploy to Appwrite`
   - `Deploy Appwrite Functions`

### 3.3 Trigger First Deployment
1. Make a small change to trigger deployment:
   ```bash
   # In your local repository
   echo "# Deployment Test" >> README.md
   git add README.md
   git commit -m "Trigger initial deployment"
   git push origin master
   ```

2. Monitor deployment:
   - Go to **Actions** tab
   - Click on the running workflow
   - Watch the deployment progress
   - Check for any errors in the logs

### 3.4 Troubleshoot Common Issues

**If deployment fails:**
1. Check GitHub Actions logs for specific errors
2. Verify all secrets are correctly set
3. Ensure Appwrite project IDs match exactly
4. Check Appwrite Console for any permission issues

**Common Error Solutions:**
- `Invalid API key`: Regenerate API key with proper scopes
- `Database not found`: Verify database ID in secrets
- `Collection not found`: Verify collection ID in secrets
- `Permission denied`: Check collection permissions

---

## Step 4: Test Integration

### 4.1 Test Appwrite Functions

#### Test Scrape Function:
1. Go to Appwrite Console → **Functions**
2. Find `scrape-function`
3. Click **Execute**
4. Test payload:
   ```json
   {
     "url": "https://example.com",
     "userId": "test-user-123"
   }
   ```
5. Check execution logs for success/errors
6. Verify data appears in your database collection

#### Test MCP Function:
1. Find `mcp-server` function
2. Click **Execute**
3. Test payload:
   ```json
   {
     "method": "tools/list"
   }
   ```
4. Should return available MCP tools

### 4.2 Test Frontend Application

#### Local Testing:
1. Create `.env.local` file:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   VITE_APPWRITE_COLLECTION_ID=your-collection-id
   VITE_APPWRITE_SCRAPE_FUNCTION_ID=scrape-function
   VITE_APPWRITE_MCP_FUNCTION_ID=mcp-server
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

3. Test features:
   - Submit a URL for scraping
   - Check if content appears in knowledge base
   - Try the chat/search functionality

#### Production Testing:
1. Wait for GitHub Actions deployment to complete
2. Visit your deployed application URL
3. Test the same features as local testing
4. Check browser console for any errors

### 4.3 Test MCP Integration

#### Using MCP Client:
1. Install MCP client or use provided test scripts
2. Connect to your MCP server function URL
3. Test available tools:
   ```bash
   # If you have MCP client installed
   mcp connect https://your-appwrite-function-url
   ```

4. Test search functionality:
   ```json
   {
     "method": "tools/call",
     "params": {
       "name": "search_clips",
       "arguments": {
         "query": "test search"
       }
     }
   }
   ```

### 4.4 Verify Complete Integration

#### End-to-End Test:
1. **Submit Content**: Use frontend to submit a URL
2. **Check Database**: Verify content appears in Appwrite database
3. **Search Content**: Use search functionality to find the content
4. **MCP Access**: Verify MCP server can access the same content
5. **GitHub Actions**: Confirm deployments work on code changes

#### Performance Testing:
- Submit multiple URLs
- Test with different content types (articles, videos, etc.)
- Verify search performance with larger datasets
- Check function execution times in Appwrite Console

---

## Troubleshooting Guide

### GitHub Actions Issues
- **Build fails**: Check Node.js version compatibility
- **Secrets not found**: Verify secret names match exactly
- **Permission denied**: Check API key scopes

### Appwrite Issues
- **Function timeout**: Increase timeout in function settings
- **Database connection**: Verify database and collection IDs
- **CORS errors**: Add your domain to Appwrite project settings

### Frontend Issues
- **Environment variables**: Check `.env.local` file
- **API calls failing**: Verify function IDs and endpoints
- **Authentication issues**: Check auth configuration

---

## Success Checklist

- [ ] All GitHub secrets configured
- [ ] Appwrite project created with database and collection
- [ ] GitHub Actions workflows running successfully
- [ ] Scrape function working and storing data
- [ ] MCP server function responding to requests
- [ ] Frontend application deployed and functional
- [ ] End-to-end content submission and retrieval working
- [ ] Search functionality operational
- [ ] MCP integration accessible

**Congratulations! Your RAG Knowledge Base is now fully deployed and operational! 🎉**

For ongoing maintenance and updates, refer to the main `DEPLOYMENT.md` file for detailed operational procedures.