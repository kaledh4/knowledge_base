"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Youtube, FileText, Twitter, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface KnowledgeEntry {
  id: string
  type: "youtube" | "text" | "twitter"
  title: string
  content: string
  url?: string
  tags: string[]
  createdAt: Date
  metadata?: {
    channelName?: string
    duration?: string
    publishedAt?: string
  }
}

export function ContentSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "extracting" | "success" | "error">("idle")
  const [extractionMessage, setExtractionMessage] = useState("")
  const { toast } = useToast()

  // YouTube form state
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeTitle, setYoutubeTitle] = useState("")
  const [extractedContent, setExtractedContent] = useState("")

  // Text form state
  const [textTitle, setTextTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  const [textTags, setTextTags] = useState("")

  // Twitter form state
  const [twitterUrl, setTwitterUrl] = useState("")
  const [twitterTitle, setTwitterTitle] = useState("")
  const [extractedTwitterContent, setExtractedTwitterContent] = useState("")
  const [isExtractingTwitter, setIsExtractingTwitter] = useState(false)

  const saveToSupabase = async (entry: Omit<KnowledgeEntry, "id" | "createdAt">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save entries.",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("knowledge_entries").insert({ ...entry, user_id: user.id })

    if (error) {
      throw new Error(error.message)
    }
  }

  const extractYouTubeContent = async () => {
    if (!youtubeUrl) return

    setExtractionStatus("extracting")
    setExtractionMessage("Extracting video content...")

    try {
      const response = await fetch("/api/youtube/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to extract content")
      }

      const data = await response.json()

      setYoutubeTitle(data.title)
      setExtractedContent(data.transcript)
      setExtractionStatus("success")
      setExtractionMessage("Content extracted successfully!")

      toast({
        title: "Content extracted!",
        description: "YouTube video content has been extracted and is ready to save.",
      })
    } catch (error) {
      console.error("Extraction error:", error)
      setExtractionStatus("error")
      setExtractionMessage(error instanceof Error ? error.message : "Failed to extract content")

      toast({
        title: "Extraction failed",
        description: "Could not extract video content. You can still save the link manually.",
        variant: "destructive",
      })
    }
  }

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await saveToSupabase({
        type: "youtube",
        title: youtubeTitle || "YouTube Video",
        content:
          extractedContent ||
          `YouTube video: ${youtubeUrl}\n\n[Content extraction was not successful, but the link has been saved]`,
        url: youtubeUrl,
        tags: ["youtube", "video"],
      })

      toast({
        title: "YouTube content saved!",
        description: "Video has been added to your knowledge base.",
      })

      // Reset form
      setYoutubeUrl("")
      setYoutubeTitle("")
      setExtractedContent("")
      setExtractionStatus("idle")
      setExtractionMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save YouTube content.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await saveToSupabase({
        type: "text",
        title: textTitle,
        content: textContent,
        tags: textTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })

      toast({
        title: "Text content added!",
        description: "Your content has been saved to the knowledge base.",
      })

      setTextTitle("")
      setTextContent("")
      setTextTags("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save text content.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const extractTwitterContent = async () => {
    if (!twitterUrl) return

    setIsExtractingTwitter(true)
    setExtractedTwitterContent("")

    try {
      const response = await fetch("/api/x/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: twitterUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract tweet content")
      }

      const data = await response.json()
      setExtractedTwitterContent(data.content)

      toast({
        title: "Tweet content extracted!",
        description: "The content of the tweet has been successfully extracted.",
      })
    } catch (error) {
      console.error("Twitter extraction error:", error)
      setExtractedTwitterContent("[Could not extract tweet content.]")
      toast({
        title: "Extraction Failed",
        description: "Could not extract content from the tweet. You can still save the link.",
        variant: "destructive",
      })
    } finally {
      setIsExtractingTwitter(false)
    }
  }

  const handleTwitterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await saveToSupabase({
        type: "twitter",
        title: twitterTitle || "Twitter Post",
        content: extractedTwitterContent || `Twitter/X post: ${twitterUrl}\n\n[Content not extracted]`,
        url: twitterUrl,
        tags: ["twitter", "social"],
      })

      toast({
        title: "Twitter post added!",
        description: "Post has been saved to your knowledge base.",
      })

      setTwitterUrl("")
      setTwitterTitle("")
      setExtractedTwitterContent("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Twitter post.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* YouTube Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <Youtube className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">YouTube Videos</CardTitle>
              <CardDescription>Extract text from video content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleYouTubeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={extractYouTubeContent}
                  disabled={!youtubeUrl || extractionStatus === "extracting"}
                >
                  {extractionStatus === "extracting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
                </Button>
              </div>
            </div>

            {extractionStatus !== "idle" && (
              <Alert className={extractionStatus === "error" ? "border-destructive" : ""}>
                <div className="flex items-center gap-2">
                  {extractionStatus === "extracting" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {extractionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {extractionStatus === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                  <AlertDescription>{extractionMessage}</AlertDescription>
                </div>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="youtube-title">Title</Label>
              <Input
                id="youtube-title"
                placeholder="Video title (auto-filled after extraction)"
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
              />
            </div>

            {extractedContent && (
              <div className="space-y-2">
                <Label>Extracted Content Preview</Label>
                <Textarea
                  value={extractedContent.substring(0, 200) + "..."}
                  readOnly
                  className="min-h-[80px] text-sm"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save to Knowledge Base
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Text Content Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Text Content</CardTitle>
              <CardDescription>Add articles, notes, or any text</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-title">Title</Label>
              <Input
                id="text-title"
                placeholder="Content title"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                placeholder="Paste your text content here..."
                className="min-h-[100px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-tags">Tags (comma-separated)</Label>
              <Input
                id="text-tags"
                placeholder="ai, research, notes"
                value={textTags}
                onChange={(e) => setTextTags(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Content
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Twitter/X Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10 border border-slate-500/20">
              <Twitter className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg">X (Twitter) Posts</CardTitle>
              <CardDescription>Save interesting tweets and threads</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTwitterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-url">Post URL</Label>
              <div className="flex gap-2">
                <Input
                  id="twitter-url"
                  type="url"
                  placeholder="https://x.com/username/status/..."
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={extractTwitterContent}
                  disabled={!twitterUrl || isExtractingTwitter}
                >
                  {isExtractingTwitter ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter-title">Title (optional)</Label>
              <Input
                id="twitter-title"
                placeholder="Custom title for this post"
                value={twitterTitle}
                onChange={(e) => setTwitterTitle(e.target.value)}
              />
            </div>
            {extractedTwitterContent && (
              <div className="space-y-2">
                <Label>Extracted Content</Label>
                <Textarea value={extractedTwitterContent} readOnly className="min-h-[80px] text-sm" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Post
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}