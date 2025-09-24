"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Session } from "@supabase/supabase-js"
import { Auth } from "@/components/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Database, Sparkles, Bot, LogOut } from "lucide-react"
import { ContentSubmissionForm } from "@/components/content-submission-form"
import { KnowledgeBaseList } from "@/components/knowledge-base-list"
import { LLMChat } from "@/components/llm-chat"

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState("add")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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

            <ContentSubmissionForm key={session.user.id} />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-balance">Your Knowledge Collection</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Browse, search, and manage your curated content. Export to different formats or connect to LLMs.
              </p>
            </div>

            <KnowledgeBaseList key={session.user.id} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-balance">AI-Powered Knowledge Chat</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Chat with your knowledge base using AI. Ask questions about your content and get intelligent responses
                based on your curated information.
              </p>
            </div>

            <LLMChat key={session.user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
