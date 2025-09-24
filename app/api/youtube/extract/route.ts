import { type NextRequest, NextResponse } from "next/server"
import { Innertube } from "youtubei.js"

interface YouTubeTranscriptResponse {
  title: string
  transcript: string
  duration: string
  channelName: string
  publishedAt: string
}

// A more robust extraction function with a custom User-Agent to mimic a real browser
async function extractYouTubeInfo(url: string) {
  const youtube = await Innertube.create({
    // Using a common browser user agent can help avoid getting blocked
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      headers.set(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      )
      const newInit = { ...init, headers }
      return fetch(input, newInit)
    },
  })

  try {
    const video = await youtube.getInfo(url)

    let transcriptText = "[No transcript available for this video.]"
    let transcriptError = null

    try {
      if (video.captions) {
        const transcript = await video.getTranscript()
        if (transcript.transcript.length > 0) {
          transcriptText = transcript.transcript.map((line) => line.text).join(" ")
        }
      }
    } catch (error: any) {
      transcriptError = error.message
      console.error("Could not fetch transcript, falling back.", transcriptError)
      if (transcriptError.includes("disabled")) {
        transcriptText = "[Transcript is disabled by the video creator.]"
      } else {
        transcriptText = "[Transcript is unavailable for this video.]"
      }
    }

    return {
      title: video.basic_info.title,
      channelName: video.basic_info.channel?.name,
      duration: video.basic_info.duration_string,
      publishedAt: video.basic_info.publish_date,
      transcript: transcriptText,
    }
  } catch (error: any) {
    console.error("YouTube extraction error:", error)
    let errorMessage = "Failed to extract YouTube content."
    if (error.message.includes("unavailable")) {
      errorMessage = "This video is unavailable and cannot be processed due to YouTube's restrictions."
    }
    throw new Error(errorMessage)
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