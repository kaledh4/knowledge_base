import { POST } from "@/app/api/x/extract/route"
import { vi, describe, it, expect, afterEach } from "vitest"

// Mock the global fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("X/Twitter Extraction API", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should extract content from the og:description meta tag", async () => {
    const mockHtml = `
      <html>
        <head>
          <meta property="og:description" content="This is the tweet content." />
        </head>
        <body></body>
      </html>
    `
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    })

    const request = {
      json: async () => ({ url: "https://x.com/user/status/123" }),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.content).toBe("This is the tweet content.")
  })

  it("should handle cases where the meta tag is not found", async () => {
    const mockHtml = `
      <html>
        <head></head>
        <body></body>
      </html>
    `
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    })

    const request = {
      json: async () => ({ url: "https://x.com/user/status/123" }),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.content).toBe("[Could not extract tweet content. The post might be private, deleted, or a video.]")
  })

  it("should handle fetch errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    })

    const request = {
      json: async () => ({ url: "https://x.com/user/status/123" }),
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to extract tweet content")
  })
})