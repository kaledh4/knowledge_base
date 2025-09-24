import { type NextRequest, NextResponse } from "next/server"

interface YouTubeTranscriptResponse {
  title: string
  transcript: string
  duration: string
  channelName: string
  publishedAt: string
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Fetch YouTube video metadata using oEmbed API
async function getVideoMetadata(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oembedUrl)

    if (!response.ok) {
      throw new Error("Failed to fetch video metadata")
    }

    const data = await response.json()
    return {
      title: data.title,
      channelName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
    }
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return null
  }
}

// Extract transcript using youtube-transcript library approach
async function getTranscript(videoId: string): Promise<string> {
  try {
    // For now, we'll return a placeholder since we can't install external packages
    // In a real implementation, you would use youtube-transcript or similar
    return `[Transcript extraction is not yet implemented. This is a placeholder for video ID: ${videoId}]

To implement full transcript extraction, you would need to:
1. Install a package like 'youtube-transcript' or 'youtubei-dl'
2. Handle different transcript languages
3. Parse and clean the transcript text
4. Handle videos without transcripts

For now, you can manually paste transcript text in the text content section.`
  } catch (error) {
    console.error("Error extracting transcript:", error)
    throw new Error("Failed to extract transcript")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId)
    if (!metadata) {
      return NextResponse.json({ error: "Could not fetch video information" }, { status: 404 })
    }

    // Get transcript
    const transcript = await getTranscript(videoId)

    const response: YouTubeTranscriptResponse = {
      title: metadata.title,
      transcript,
      duration: "Unknown", // Would be extracted with full implementation
      channelName: metadata.channelName,
      publishedAt: "Unknown", // Would be extracted with full implementation
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("YouTube extraction error:", error)
    return NextResponse.json({ error: "Failed to extract YouTube content" }, { status: 500 })
  }
}
