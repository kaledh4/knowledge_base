"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Youtube,
  FileText,
  Twitter,
  Search,
  Calendar,
  ExternalLink,
  Trash2,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Copy,
  Tag,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KnowledgeEntry {
  id: number
  type: "youtube" | "text" | "twitter"
  title: string
  content: string
  url?: string
  tags: string[]
  created_at: string
  metadata?: {
    channelName?: string
    duration?: string
    publishedAt?: string
  }
}

type SortOption = "newest" | "oldest" | "title" | "type"
type FilterOption = "all" | "youtube" | "text" | "twitter"

export function KnowledgeBaseList() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from("knowledge_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching entries:", error)
          toast({
            title: "Error",
            description: "Could not fetch your knowledge base.",
            variant: "destructive",
          })
        } else {
          setEntries(data || [])
        }
      }
      setLoading(false)
    }

    fetchEntries()

    const subscription = supabase
      .channel("knowledge_entries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "knowledge_entries" },
        (payload) => {
          console.log("Change received!", payload)
          fetchEntries() // Refetch on any change
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [toast])

  const filteredEntries = useMemo(() => {
    let filtered = entries

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filterBy !== "all") {
      filtered = filtered.filter((entry) => entry.type === filterBy)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "type":
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, filterBy, sortBy, entries])

  const deleteEntry = async (id: number) => {
    const { error } = await supabase.from("knowledge_entries").delete().match({ id })
    if (error) {
      toast({ title: "Error deleting entry", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Entry deleted" })
      // The realtime subscription will handle the UI update
    }
  }

  const saveEdit = async () => {
    if (!editingEntry) return

    const { error } = await supabase
      .from("knowledge_entries")
      .update({
        title: editTitle,
        content: editContent,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      .match({ id: editingEntry.id })

    if (error) {
      toast({ title: "Error updating entry", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Entry updated" })
      setEditingEntry(null)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `knowledge-base-${new Date().toISOString().split("T")[0]}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
    toast({ title: "Export complete" })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  const startEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry)
    setEditTitle(entry.title)
    setEditContent(entry.content)
    setEditTags(entry.tags.join(", "))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-400" />
      case "text":
        return <FileText className="h-4 w-4 text-blue-400" />
      case "twitter":
        return <Twitter className="h-4 w-4 text-slate-400" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "youtube":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "text":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "twitter":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No content yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Start building your knowledge base by adding YouTube videos, text content, or social posts.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              {sortBy === "newest" || sortBy === "oldest" ? (
                sortBy === "newest" ? (
                  <SortDesc className="h-4 w-4 mr-2" />
                ) : (
                  <SortAsc className="h-4 w-4 mr-2" />
                )
              ) : (
                <SortAsc className="h-4 w-4 mr-2" />
              )}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{entries.length} total entries</span>
        <Separator orientation="vertical" className="h-4" />
        <span>{filteredEntries.length} showing</span>
      </div>

      {/* Entries */}
      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${getTypeColor(entry.type)}`}
                  >
                    {getTypeIcon(entry.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {getTypeIcon(entry.type)}
                          {entry.title}
                        </DialogTitle>
                        <DialogDescription>
                          {entry.type} • {new Date(entry.created_at).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Content</Label>
                          <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                            {entry.content}
                          </div>
                        </div>
                        {entry.tags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(entry.content)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Content
                          </Button>
                          {entry.url && (
                            <Button variant="outline" size="sm" onClick={() => window.open(entry.url, "_blank")}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Entry</DialogTitle>
                        <DialogDescription>Make changes to your knowledge base entry.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Title</Label>
                          <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="edit-content">Content</Label>
                          <Textarea
                            id="edit-content"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[200px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                          <Input
                            id="edit-tags"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            placeholder="ai, research, notes"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditingEntry(null)}>
                            Cancel
                          </Button>
                          <Button onClick={saveEdit}>Save Changes</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {entry.url && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(entry.url, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{entry.content}</p>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}