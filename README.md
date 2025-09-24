# OWN RAG - Personal Knowledge Management System

A comprehensive personal knowledge management system built with Next.js, Appwrite, and MCP (Model Context Protocol) integration. This system allows you to scrape, store, and manage web content and video information with AI-powered search capabilities.

## Features

- 🌐 **Web Content Scraping**: Extract text content from any URL using trafilatura
- 🎥 **Video Information Extraction**: Get metadata and transcripts from video URLs using yt-dlp
- 🔍 **Full-Text Search**: Search through your saved clips with powerful indexing
- 🤖 **MCP Integration**: Model Context Protocol server for AI assistant integration
- 🔐 **User Authentication**: Secure user management with Appwrite Auth
- 📱 **Modern UI**: Responsive interface built with Next.js and Tailwind CSS
- ☁️ **Cloud Functions**: Serverless backend with Appwrite Functions

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  Appwrite API   │────│   Database      │
│   (Frontend)    │    │   (Backend)     │    │   (Collections) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│  MCP Server     │
                        │  (AI Integration)│
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │ Scrape Function │
                        │ (Content Extract)│
                        └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Appwrite Cloud account or self-hosted instance
- Python 3.8+ (for scraping functions)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd OWN_RAG
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Appwrite credentials
# Get these from your Appwrite console
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=clips-db
VITE_APPWRITE_COLLECTION_ID=clips
```

### 3. Deploy Appwrite Backend

```bash
# Install deployment dependencies
npm install node-appwrite dotenv

# Run deployment script
node deploy.js
```

This will:
- Create the database and collections
- Set up proper indexes for search
- Configure function environments
- Deploy the scrape and MCP functions

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
OWN_RAG/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── clip-manager.tsx  # Main clip management interface
├── lib/                  # Utility libraries
│   ├── appwrite.ts      # Appwrite client configuration
│   └── utils.ts         # Helper functions
├── functions/            # Appwrite Functions
│   ├── scrape/          # Content scraping function
│   │   ├── src/main.js  # Scraping logic
│   │   ├── package.json # Dependencies
│   │   └── appwrite.json# Function configuration
│   └── mcp/             # MCP server function
│       ├── src/main.js  # MCP server implementation
│       ├── package.json # Dependencies
│       └── appwrite.json# Function configuration
├── deploy.js            # Deployment automation script
├── .env.example         # Environment template
└── README.md           # This file
```

## Functions Overview

### Scrape Function (`/functions/scrape`)

Extracts content from URLs using:
- **trafilatura**: Primary text extraction tool
- **cheerio**: Fallback HTML parsing
- **yt-dlp**: Video metadata and transcript extraction

**Supported Content Types:**
- Web articles and blog posts
- YouTube videos (metadata + transcripts)
- PDF documents (when accessible via URL)
- Social media posts

### MCP Server Function (`/functions/mcp`)

Provides AI assistant integration through Model Context Protocol:

**Resources:**
- `clips://recent` - Recently added clips
- `clips://all` - All user clips
- `clips://search` - Searchable clip interface

**Tools:**
- `create_clip` - Add new content from URL
- `search_clips` - Full-text search
- `get_clip` - Retrieve specific clip
- `delete_clip` - Remove clip

## Database Schema

### Clips Collection

```javascript
{
  "$id": "unique_clip_id",
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": "Extracted text content...",
  "metadata": {
    "author": "Author Name",
    "publishDate": "2024-01-01",
    "duration": "10:30", // for videos
    "wordCount": 1500
  },
  "userId": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "$permissions": [
    "read(\"user:user_id\")",
    "write(\"user:user_id\")",
    "delete(\"user:user_id\")"
  ]
}
```

### Indexes

- `userId_index` - Fast user-specific queries
- `createdAt_index` - Chronological sorting
- `title_search` - Full-text search on titles
- `content_search` - Full-text search on content

## API Usage

### Frontend Integration

```typescript
import { databases, account } from '@/lib/appwrite';

// Create a new clip
const createClip = async (url: string) => {
  const user = await account.get();
  const response = await functions.createExecution(
    'scrape',
    JSON.stringify({ url }),
    false
  );
  return JSON.parse(response.response);
};

// Search clips
const searchClips = async (query: string) => {
  return await databases.listDocuments(
    'clips-db',
    'clips',
    [
      Query.search('title', query),
      Query.search('content', query)
    ]
  );
};
```

### MCP Integration

```javascript
// Connect to MCP server
const mcpClient = new Client({
  name: "clip-manager",
  version: "1.0.0"
});

// Use MCP tools
const result = await mcpClient.callTool("create_clip", {
  url: "https://example.com/article"
});
```

## Deployment

### Production Deployment

1. **Deploy to Vercel/Netlify:**
   ```bash
   npm run build
   # Deploy build folder to your hosting platform
   ```

2. **Configure Appwrite Functions:**
   - Upload function code via Appwrite Console
   - Set environment variables
   - Enable function execution

3. **Set Production Environment:**
   ```bash
   # Update .env.production
   VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
   VITE_APPWRITE_PROJECT_ID=production-project-id
   ```

### Self-Hosted Appwrite

If using self-hosted Appwrite:

```bash
# Clone Appwrite
git clone https://github.com/appwrite/appwrite.git
cd appwrite

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start Appwrite
docker-compose up -d
```

## Development

### Adding New Features

1. **Frontend Components**: Add to `/components`
2. **API Routes**: Use Appwrite SDK in `/lib`
3. **Functions**: Create in `/functions` directory
4. **Styling**: Use Tailwind CSS classes

### Testing Functions Locally

```bash
# Test scrape function
cd functions/scrape
node -e "require('./src/main.js').default({data: JSON.stringify({url: 'https://example.com'})})"

# Test MCP server
cd functions/mcp
node src/main.js
```

## Troubleshooting

### Common Issues

1. **Function Timeout**: Increase timeout in `appwrite.json`
2. **Permission Denied**: Check collection permissions
3. **Scraping Fails**: Verify Python dependencies are installed
4. **MCP Connection**: Ensure function is deployed and accessible

### Debug Mode

Enable debug logging:

```javascript
// In function code
console.log('Debug:', JSON.stringify(data, null, 2));
```

### Performance Optimization

- Use database indexes for frequent queries
- Implement caching for repeated scrapes
- Optimize content extraction for large documents
- Use pagination for large result sets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review Appwrite [documentation](https://appwrite.io/docs)
- Check MCP [specification](https://modelcontextprotocol.io/)

---

**Built with ❤️ using Next.js, Appwrite, and MCP**