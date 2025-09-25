import { type NextRequest, NextResponse } from "next/server"
import { Scraper } from "@catdevnull/twitter-scraper"

async function extractTweetContent(url: string): Promise<string | null> {
  try {
    const scraper = new Scraper()
    const tweetId = url.split("/").pop()
    if (!tweetId) {
      throw new Error("Invalid Tweet URL")
    }
    const tweet = await scraper.getTweet(tweetId)

    if (tweet && tweet.text) {
      return tweet.text
    }

    return null
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

    if (content) {
      return NextResponse.json({ content })
    }

    return NextResponse.json({ error: "Failed to extract tweet content" }, { status: 500 })
  } catch (error) {
    console.error("X extraction error:", error)
    return NextResponse.json({ error: "Failed to extract X/Twitter content" }, { status: 500 })
  }
}