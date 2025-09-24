const { Client, Databases, ID } = require('node-appwrite');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const urlParse = require('url-parse');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

// Configure Appwrite
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Helper function to extract text using trafilatura
function extractTextWithTrafilatura(html) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join('/tmp', `content_${Date.now()}.html`);
    fs.writeFileSync(tempFile, html);
    
    const trafilatura = spawn('trafilatura', ['-f', tempFile]);
    let output = '';
    let error = '';
    
    trafilatura.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    trafilatura.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    trafilatura.on('close', (code) => {
      fs.unlinkSync(tempFile); // Clean up temp file
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Trafilatura failed: ${error}`));
      }
    });
  });
}

// Helper function to extract video info using yt-dlp
function extractVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', [
      '--dump-json',
      '--no-download',
      '--ignore-errors',
      url
    ]);
    
    let output = '';
    let error = '';
    
    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ytdlp.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    ytdlp.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          const videoInfo = JSON.parse(output.trim());
          resolve({
            title: videoInfo.title || 'Unknown Title',
            description: videoInfo.description || '',
            duration: videoInfo.duration || 0,
            uploader: videoInfo.uploader || 'Unknown',
            upload_date: videoInfo.upload_date || '',
            view_count: videoInfo.view_count || 0
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse video info: ${parseError.message}`));
        }
      } else {
        reject(new Error(`yt-dlp failed: ${error}`));
      }
    });
  });
}

// Helper function to scrape regular web pages
async function scrapeWebPage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Try to extract text using trafilatura first
    try {
      const extractedText = await extractTextWithTrafilatura(html);
      if (extractedText && extractedText.length > 100) {
        return extractedText;
      }
    } catch (trafilaturaError) {
      console.log('Trafilatura failed, falling back to cheerio:', trafilaturaError.message);
    }
    
    // Fallback to cheerio for basic text extraction
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();
    
    // Extract text from main content areas
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];
    
    let extractedText = '';
    for (const selector of contentSelectors) {
      const content = $(selector).text();
      if (content && content.length > extractedText.length) {
        extractedText = content;
      }
    }
    
    // If no specific content area found, extract from body
    if (!extractedText || extractedText.length < 100) {
      extractedText = $('body').text();
    }
    
    // Clean up the text
    return extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
      
  } catch (error) {
    throw new Error(`Failed to scrape web page: ${error.message}`);
  }
}

// Main function
module.exports = async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const { url, userId } = JSON.parse(req.body || '{}');
    
    if (!url) {
      return res.json({ error: 'URL is required' }, 400);
    }
    
    if (!userId) {
      return res.json({ error: 'User ID is required' }, 400);
    }
    
    log(`Processing URL: ${url}`);
    
    const parsedUrl = urlParse(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    let title = '';
    let content = '';
    let metadata = {};
    
    // Check if it's a video platform
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv'];
    const isVideo = videoHosts.some(host => hostname.includes(host));
    
    if (isVideo) {
      log('Detected video URL, using yt-dlp');
      try {
        const videoInfo = await extractVideoInfo(url);
        title = videoInfo.title;
        content = `${videoInfo.description}\n\nUploader: ${videoInfo.uploader}\nDuration: ${videoInfo.duration} seconds\nViews: ${videoInfo.view_count}`;
        metadata = {
          type: 'video',
          duration: videoInfo.duration,
          uploader: videoInfo.uploader,
          upload_date: videoInfo.upload_date,
          view_count: videoInfo.view_count
        };
      } catch (videoError) {
        log(`Video extraction failed: ${videoError.message}`);
        // Fallback to web scraping
        content = await scrapeWebPage(url);
        title = content.substring(0, 100) + '...';
        metadata = { type: 'webpage', extraction_method: 'fallback' };
      }
    } else {
      log('Detected web page, using web scraping');
      content = await scrapeWebPage(url);
      
      // Extract title from content (first line or first 100 chars)
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      title = lines[0] ? lines[0].substring(0, 100) : content.substring(0, 100);
      if (title.length === 100) title += '...';
      
      metadata = { type: 'webpage', extraction_method: 'web_scraping' };
    }
    
    // Validate extracted content
    if (!content || content.length < 50) {
      return res.json({ error: 'Could not extract meaningful content from URL' }, 400);
    }
    
    // Store in Appwrite database
    const document = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        url: url,
        title: title,
        content: content,
        metadata: JSON.stringify(metadata),
        userId: userId,
        createdAt: new Date().toISOString()
      }
    );
    
    log(`Successfully created document: ${document.$id}`);
    
    return res.json({
      success: true,
      documentId: document.$id,
      title: title,
      contentLength: content.length,
      metadata: metadata
    });
    
  } catch (err) {
    error(`Function execution failed: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};