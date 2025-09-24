"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Settings, Loader2, Database, Sparkles, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KnowledgeEntry {
  id: string
  type: "youtube" | "text" | "twitter"
  title: string
  content: string
  url?: string
  tags: string[]
  createdAt: Date
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
}

type LLMProvider = "openai" | "anthropic" | "local" | "custom"

export function LLMChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([])
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>("openai")
  const [apiKey, setApiKey] = useState("")
  const [customEndpoint, setCustomEndpoint] = useState("")
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant with access to the user's personal knowledge base. Use the provided context to answer questions accurately and cite your sources when possible.",
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load knowledge base from localStorage
    const stored = localStorage.getItem("knowledgeBase")
    if (stored) {
      const parsed = JSON.parse(stored).map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      }))
      setKnowledgeBase(parsed)
    }

    // Load chat history
    const chatHistory = localStorage.getItem("chatHistory")
    if (chatHistory) {
      const parsed = JSON.parse(chatHistory).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(parsed)
    }

    // Load settings
    const settings = localStorage.getItem("llmSettings")
    if (settings) {
      const parsed = JSON.parse(settings)
      setSelectedProvider(parsed.provider || "openai")
      setApiKey(parsed.apiKey || "")
      setCustomEndpoint(parsed.customEndpoint || "")
      setSystemPrompt(parsed.systemPrompt || systemPrompt)
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const saveSettings = () => {
    const settings = {
      provider: selectedProvider,
      apiKey,
      customEndpoint,
      systemPrompt,
    }
    localStorage.setItem("llmSettings", JSON.stringify(settings))
    toast({
      title: "Settings saved",
      description: "Your LLM configuration has been saved.",
    })
  }

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    localStorage.setItem("chatHistory", JSON.stringify(newMessages))
  }

  const findRelevantContext = (query: string): KnowledgeEntry[] => {
    const queryLower = query.toLowerCase()
    return knowledgeBase
      .filter((entry) => {
        return (
          entry.title.toLowerCase().includes(queryLower) ||
          entry.content.toLowerCase().includes(queryLower) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(queryLower))
        )
      })
      .slice(0, 5) // Limit to top 5 most relevant entries
  }

  const simulateAIResponse = async (userMessage: string, context: KnowledgeEntry[]): Promise<string> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // This is a mock response - in a real implementation, you would call your chosen LLM API
    const contextSummary =
      context.length > 0
        ? `Based on your knowledge base, I found ${context.length} relevant entries: ${context.map((c) => c.title).join(", ")}.`
        : "I don't have specific information about this in your knowledge base."

    const responses = [
      `${contextSummary} Here's what I can tell you about "${userMessage}": This is a simulated response. In a real implementation, this would be powered by ${selectedProvider} API.`,
      `${contextSummary} Regarding your question about "${userMessage}", I would analyze the content from your knowledge base and provide a comprehensive answer using the ${selectedProvider} model.`,
      `${contextSummary} To properly answer "${userMessage}", I would need to process your knowledge base content through the ${selectedProvider} API and provide contextual insights.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsLoading(true)

    try {
      // Find relevant context from knowledge base
      const relevantContext = findRelevantContext(inputMessage)

      // Simulate AI response (replace with actual API call)
      const aiResponse = await simulateAIResponse(inputMessage, relevantContext)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        sources: relevantContext.map((entry) => entry.title),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)
      saveChatHistory(finalMessages)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("chatHistory")
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared.",
    })
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Settings Panel */}
      <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            LLM Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <Select value={selectedProvider} onValueChange={(value: LLMProvider) => setSelectedProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI GPT</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="local">Local Model</SelectItem>
                <SelectItem value="custom">Custom Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {selectedProvider === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Endpoint</label>
              <Input
                placeholder="https://api.example.com/v1/chat"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              placeholder="System instructions for the AI..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save Settings
          </Button>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              <span>Knowledge Base: {knowledgeBase.length} entries</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Status: {apiKey ? "Configured" : "Not configured"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5" />
              AI Knowledge Chat
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground max-w-sm">
                  Ask questions about your knowledge base content. The AI will search through your entries and provide
                  contextual answers.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg p-3 bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your knowledge base..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: This is a demo interface. Configure your LLM provider in the settings panel to enable real AI
            responses.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
