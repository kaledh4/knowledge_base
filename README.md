# Knowledge Base Builder

A modern, AI-powered knowledge management system that helps you collect, organize, and query content from various sources including YouTube videos, Twitter/X posts, and text content.

## ✨ Features

- **Email/Password Authentication** - Secure login system using Supabase Auth
- **Multi-Source Content Extraction**:
  - YouTube video transcripts and metadata
  - Twitter/X post content extraction
  - Manual text content submission
- **Vector Search with ChromaDB** - Advanced semantic search capabilities
- **AI Chat Interface** - Query your knowledge base using natural language
- **Modern UI** - Built with Next.js, Tailwind CSS, and Radix UI components
- **Real-time Updates** - Live synchronization of content

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- ChromaDB instance (optional - for vector search)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knowledge_base
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and update with your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # ChromaDB Configuration (optional)
   CHROMA_URL=http://localhost:8000
   ```

4. **Set up Supabase Database**
   
   Create a table called `knowledge_entries` with the following structure:
   ```sql
   CREATE TABLE knowledge_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL CHECK (type IN ('youtube', 'text', 'twitter')),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     url TEXT,
     tags TEXT[] DEFAULT '{}',
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable Row Level Security
   ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
   
   -- Create policy for users to only see their own entries
   CREATE POLICY "Users can only see their own entries" ON knowledge_entries
     FOR ALL USING (auth.uid() = user_id);
   ```

5. **Start ChromaDB (Optional)**
   
   For vector search functionality, run ChromaDB:
   ```bash
   # Using Docker
   docker run -p 8000:8000 chromadb/chroma
   
   # Or install locally
   pip install chromadb
   chroma run --host localhost --port 8000
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Usage

### Adding Content

1. **YouTube Videos**: Paste a YouTube URL to automatically extract transcript and metadata
2. **Twitter/X Posts**: Paste a tweet URL to extract content
3. **Text Content**: Manually add articles, notes, or any text content

### AI Chat

Use the AI Chat tab to query your knowledge base:
- Ask questions about your saved content
- Get contextual answers based on semantic similarity
- View source references for each response

### Managing Content

- Browse all your saved content in the "Browse Knowledge Base" tab
- Search and filter by content type, tags, or keywords
- Export content for use with other tools

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Vector Search**: ChromaDB
- **Content Extraction**: 
  - YouTube: `youtube-transcript` + `youtubei.js`
  - Twitter: `@catdevnull/twitter-scraper`

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure Supabase database is set up with the correct schema
3. Verify ChromaDB is running (if using vector search)
4. Check the browser console for any error messages

For additional help, please open an issue on GitHub.