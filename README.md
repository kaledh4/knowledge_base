# Knowledge Base - Simple Vercel Version

A simple knowledge management system built with Next.js that runs entirely in the browser using localStorage for data persistence.

## Features

- 🌐 **Web Content Management**: Add and organize web content and notes
- 🔍 **Full-Text Search**: Search through your saved content
- 📱 **Modern UI**: Responsive interface built with Next.js and Tailwind CSS
- 💾 **Local Storage**: All data stored locally in your browser
- ⚡ **Fast Deployment**: Deploy to Vercel with zero configuration

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/kaledh4/knowledge_base.git
cd knowledge_base
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open http://localhost:3000 to view the application.

### 3. Deploy to Vercel

#### Option 1: Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Deploy with default settings (no environment variables needed)

#### Option 2: Via Git Push
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin master
```

## Project Structure
```
knowledge_base/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx            # Main application components
├── lib/                  # Utility libraries
│   └── utils.ts         # Helper functions
├── package.json          # Dependencies and scripts
└── README.md           # This file
```

## How It Works

This is a client-side application that:
- Stores all data in browser localStorage
- Provides a simple interface for managing knowledge items
- Includes search functionality across stored content
- Works entirely offline after initial load

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This application is optimized for Vercel deployment:
- No environment variables required
- No backend services needed
- Automatic builds on git push
- Global CDN distribution

**Built with ❤️ using Next.js and localStorage**