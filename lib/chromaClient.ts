import { ChromaClient } from 'chromadb'

let chromaClient: ChromaClient | null = null

export async function getChromaClient() {
  if (!chromaClient) {
    chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000"
    })
  }
  return chromaClient
}

export async function initializeCollection(collectionName: string = "knowledge_base") {
  const client = await getChromaClient()
  
  try {
    // Try to get existing collection
    const collection = await client.getCollection({
      name: collectionName,
    })
    return collection
  } catch (error) {
    // Collection doesn't exist, create it
    const collection = await client.createCollection({
      name: collectionName,
      metadata: {
        description: "Knowledge base collection for storing and retrieving content"
      }
    })
    return collection
  }
}

export async function addToChroma(
  content: string,
  metadata: Record<string, any>,
  id: string,
  collectionName: string = "knowledge_base"
) {
  const collection = await initializeCollection(collectionName)
  
  await collection.add({
    ids: [id],
    documents: [content],
    metadatas: [metadata]
  })
}

export async function searchChroma(
  query: string,
  nResults: number = 5,
  collectionName: string = "knowledge_base"
) {
  const collection = await initializeCollection(collectionName)
  
  const results = await collection.query({
    queryTexts: [query],
    nResults: nResults
  })
  
  return results
}

export async function deleteFromChroma(
  id: string,
  collectionName: string = "knowledge_base"
) {
  const collection = await initializeCollection(collectionName)
  
  await collection.delete({
    ids: [id]
  })
}