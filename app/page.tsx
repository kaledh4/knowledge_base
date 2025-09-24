"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Database, Sparkles, Bot } from "lucide-react"
import { ContentSubmissionForm } from "@/components/content-submission-form"
import { KnowledgeBaseList } from "@/components/knowledge-base-list"
import { LLMChat } from "@/components/llm-chat"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("add")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Database className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Knowledge Base Builder</h1>
                <p className="text-sm text-muted-foreground">Curate and organize your learning resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Ready
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="add" className="gap-2">
              <FileText className="h-4 w-4" />
              Add Content
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Database className="h-4 w-4" />
              Browse Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-balance">Build Your Knowledge Repository</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Collect and organize content from YouTube videos, articles, social posts, and your own notes. Create a
                searchable knowledge base that connects to any LLM.
              </p>
            </div>

            <ContentSubmissionForm />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-balance">Your Knowledge Collection</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Browse, search, and manage your curated content. Export to different formats or connect to LLMs.
              </p>
            </div>

            <KnowledgeBaseList />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-balance">AI-Powered Knowledge Chat</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Chat with your knowledge base using AI. Ask questions about your content and get intelligent responses
                based on your curated information.
              </p>
            </div>

            <LLMChat />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
