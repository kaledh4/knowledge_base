import { type NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"
import { Innertube } from "youtubei.js"

interface YouTubeTranscriptResponse {
  title: string
  transcript: string
  duration: string
  channelName: string
  publishedAt: string
}

async function extractYouTubeInfo(url: string) {
  try {
    const youtube = await Innertube.create()
    const videoInfo = await youtube.getBasicInfo(url)

    let transcriptText = "[No transcript available for this video.]"
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url)
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map((item) => item.text).join(" ")
      }
    } catch (error) {
      console.error("Error fetching transcript:", error)
      transcriptText = "[Transcript is not available for this video.]"
    }

    return {
      title: videoInfo.basic_info.title,
      channelName: videoInfo.basic_info.channel?.name,
      duration: videoInfo.basic_info.duration_string,
      publishedAt: videoInfo.basic_info.publish_date,
      transcript: transcriptText,
    }
  } catch (error: any) {
    console.error("YouTube extraction error:", error)
    throw new Error("Failed to extract YouTube content.")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const videoInfo = await extractYouTubeInfo(url)

    const response: YouTubeTranscriptResponse = {
      title: videoInfo.title || "Unknown Title",
      transcript: videoInfo.transcript,
      duration: videoInfo.duration || "Unknown",
      channelName: videoInfo.channelName || "Unknown Channel",
      publishedAt: videoInfo.publishedAt || "Unknown Date",
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Final YouTube extraction error:", error)
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 })
  }
}