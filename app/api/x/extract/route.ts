import { type NextRequest, NextResponse } from "next/server"

// A simple function to extract tweet content by fetching the HTML of a service like twitframe.com
// and parsing the OpenGraph meta tags. This avoids the need for a full browser or official API access.
async function extractTweetContent(url: string): Promise<string | null> {
  try {
    // Replace twitter.com or x.com with twitframe.com
    const twitframeUrl = url.replace(/(twitter\.com|x\.com)/, "twitframe.com")
    const response = await fetch(twitframeUrl)

    if (!response.ok) {
      throw new Error("Failed to fetch tweet content from twitframe")
    }

    const html = await response.text()

    // Use a simple regex to find the og:description meta tag content
    const match = html.match(/<meta property="og:description" content="([^"]*)"\s*\/?>/)

    if (match && match[1]) {
      // The extracted content is HTML-encoded, so we need to decode it.
      // A full library would be better, but for common cases this is a simple approach.
      const decodedContent = match[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
      return decodedContent
    }

    return "[Could not extract tweet content. The post might be private, deleted, or a video.]"
  } catch (error) {
    console.error("Error extracting tweet content:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const content = await extractTweetContent(url)

    if (!content) {
      return NextResponse.json({ error: "Failed to extract tweet content" }, { status: 500 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("X extraction error:", error)
    return NextResponse.json({ error: "Failed to extract X/Twitter content" }, { status: 500 })
  }
}