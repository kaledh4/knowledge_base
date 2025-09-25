import { POST } from "@/app/api/youtube/extract/route"
import { NextResponse } from "next/server"
import { vi, describe, it, expect } from "vitest"

vi.mock("youtube-transcript", () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn(),
  },
}))

vi.mock("youtubei.js", () => ({
  Innertube: {
    create: vi.fn().mockResolvedValue({
      getBasicInfo: vi.fn().mockResolvedValue({
        basic_info: {
          title: "Test Video",
          channel: { name: "Test Channel" },
          duration_string: "1:23",
          publish_date: "2023-01-01",
        },
      }),
    }),
  },
}))

describe("YouTube Extraction API", () => {
  it("should return a transcript when available", async () => {
    const { YoutubeTranscript } = await import("youtube-transcript")
    vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue([
      { text: "Hello", duration: 1000, offset: 0 },
      { text: "world", duration: 1000, offset: 1000 },
    ])

    const request = {
      json: async () => ({ url: "https://www.youtube.com/watch?v=test" }),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.transcript).toBe("Hello world")
    expect(data.title).toBe("Test Video")
  })

  it("should handle cases where the transcript is not available", async () => {
    const { YoutubeTranscript } = await import("youtube-transcript")
    vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue(new Error("No transcript"))

    const request = {
      json: async () => ({ url: "https://www.youtube.com/watch?v=notranscript" }),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.transcript).toBe("[Transcript is not available for this video.]")
  })

  it("should return a 400 error if the URL is missing", async () => {
    const request = {
      json: async () => ({}),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("URL is required")
  })
})