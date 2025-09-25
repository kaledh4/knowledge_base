import { type NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript, YoutubeTranscriptDisabledError } from "youtube-transcript"
import { Innertube } from "youtubei.js"

interface YouTubeTranscriptResponse {
  title: string
  transcript: string
  duration: string
  channelName: string
  publishedAt: string
}

async function extractYouTubeInfo(url: string, lang?: string) {
  let title = "Unknown Title"
  let channelName = "Unknown Channel"
  let duration = "Unknown"
  let publishedAt = "Unknown Date"
  let transcriptText = "[No transcript available for this video.]"

  const youtube = await Innertube.create()

  const videoInfoPromise = youtube.getBasicInfo(url).then(info => {
      title = info.basic_info.title || title
      channelName = info.basic_info.channel?.name || channelName
      duration = info.basic_info.duration_string || duration
      publishedAt = info.basic_info.publish_date || publishedAt
  }).catch(error => {
      console.error("Could not get video metadata, continuing to transcript extraction.", error)
  })

  const transcriptPromise = YoutubeTranscript.fetchTranscript(url, { lang }).then(transcript => {
      if (transcript && transcript.length > 0) {
          transcriptText = transcript.map((item) => item.text).join(" ")
      }
  }).catch(error => {
      console.error("Error fetching transcript:", error)
      if (error instanceof YoutubeTranscriptDisabledError) {
          transcriptText = "[Transcript is disabled by the video creator.]"
      } else {
          transcriptText = "[Transcript is not available for this video.]"
      }
  })

  await Promise.all([videoInfoPromise, transcriptPromise])

  return { title, channelName, duration, publishedAt, transcript: transcriptText }
}

export async function POST(request: NextRequest) {
  try {
    const { url, lang } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const videoInfo = await extractYouTubeInfo(url, lang)

    const response: YouTubeTranscriptResponse = {
      title: videoInfo.title,
      transcript: videoInfo.transcript,
      duration: videoInfo.duration,
      channelName: videoInfo.channelName,
      publishedAt: videoInfo.publishedAt,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Final YouTube extraction error:", error)
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 })
  }
}