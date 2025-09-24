const { Client, Databases, Query } = require('node-appwrite');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

// Configure Appwrite
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID;

// Create MCP server
const server = new Server(
  {
    name: 'clip-manager-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Helper function to get clips from database
async function getClips(userId, limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
    return response.documents;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch clips: ${error.message}`
    );
  }
}

// Helper function to search clips
async function searchClips(userId, query, limit = 20) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.or([
          Query.search('title', query),
          Query.search('content', query)
        ]),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );
    return response.documents;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search clips: ${error.message}`
    );
  }
}

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'clip://recent',
        name: 'Recent Clips',
        description: 'List of recently added clips',
        mimeType: 'application/json',
      },
      {
        uri: 'clip://all',
        name: 'All Clips',
        description: 'Complete list of all clips',
        mimeType: 'application/json',
      },
      {
        uri: 'clip://search',
        name: 'Search Clips',
        description: 'Search through clips by title and content',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const url = new URL(uri);
  
  // Extract userId from query parameters or headers
  const userId = url.searchParams.get('userId');
  if (!userId) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'userId parameter is required'
    );
  }

  switch (url.pathname) {
    case '/recent': {
      const clips = await getClips(userId, 10);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              clips: clips.map(clip => ({
                id: clip.$id,
                title: clip.title,
                url: clip.url,
                content: clip.content.substring(0, 500) + (clip.content.length > 500 ? '...' : ''),
                createdAt: clip.createdAt,
                metadata: JSON.parse(clip.metadata || '{}')
              })),
              total: clips.length
            }, null, 2),
          },
        ],
      };
    }
    
    case '/all': {
      const limit = parseInt(url.searchParams.get('limit')) || 50;
      const offset = parseInt(url.searchParams.get('offset')) || 0;
      const clips = await getClips(userId, limit, offset);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              clips: clips.map(clip => ({
                id: clip.$id,
                title: clip.title,
                url: clip.url,
                content: clip.content,
                createdAt: clip.createdAt,
                metadata: JSON.parse(clip.metadata || '{}')
              })),
              total: clips.length,
              limit,
              offset
            }, null, 2),
          },
        ],
      };
    }
    
    case '/search': {
      const query = url.searchParams.get('q');
      if (!query) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Search query parameter "q" is required'
        );
      }
      
      const clips = await searchClips(userId, query);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              query,
              clips: clips.map(clip => ({
                id: clip.$id,
                title: clip.title,
                url: clip.url,
                content: clip.content,
                createdAt: clip.createdAt,
                metadata: JSON.parse(clip.metadata || '{}'),
                relevance: 'high' // Could implement actual relevance scoring
              })),
              total: clips.length
            }, null, 2),
          },
        ],
      };
    }
    
    default:
      throw new McpError(
        ErrorCode.InvalidParams,
        `Unknown resource path: ${url.pathname}`
      );
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_clip',
        description: 'Create a new clip by scraping content from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape and create a clip from',
            },
            userId: {
              type: 'string',
              description: 'The ID of the user creating the clip',
            },
          },
          required: ['url', 'userId'],
        },
      },
      {
        name: 'delete_clip',
        description: 'Delete a clip by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            clipId: {
              type: 'string',
              description: 'The ID of the clip to delete',
            },
            userId: {
              type: 'string',
              description: 'The ID of the user who owns the clip',
            },
          },
          required: ['clipId', 'userId'],
        },
      },
      {
        name: 'search_clips',
        description: 'Search clips by title and content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
            userId: {
              type: 'string',
              description: 'The ID of the user to search clips for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
              default: 20,
            },
          },
          required: ['query', 'userId'],
        },
      },
      {
        name: 'get_clip',
        description: 'Get a specific clip by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            clipId: {
              type: 'string',
              description: 'The ID of the clip to retrieve',
            },
            userId: {
              type: 'string',
              description: 'The ID of the user who owns the clip',
            },
          },
          required: ['clipId', 'userId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_clip': {
      const { url, userId } = args;
      
      try {
        // Call the scrape function to create the clip
        const scrapeResponse = await fetch(`${process.env.APPWRITE_FUNCTION_ENDPOINT}/functions/scrape/executions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': process.env.APPWRITE_FUNCTION_PROJECT_ID,
            'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
          },
          body: JSON.stringify({ url, userId }),
        });
        
        const result = await scrapeResponse.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create clip');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully created clip: ${result.title}\nDocument ID: ${result.documentId}\nContent length: ${result.contentLength} characters`,
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create clip: ${error.message}`
        );
      }
    }
    
    case 'delete_clip': {
      const { clipId, userId } = args;
      
      try {
        // First verify the clip belongs to the user
        const clip = await databases.getDocument(DATABASE_ID, COLLECTION_ID, clipId);
        
        if (clip.userId !== userId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'You can only delete your own clips'
          );
        }
        
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, clipId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully deleted clip: ${clip.title}`,
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to delete clip: ${error.message}`
        );
      }
    }
    
    case 'search_clips': {
      const { query, userId, limit = 20 } = args;
      
      try {
        const clips = await searchClips(userId, query, limit);
        
        return {
          content: [
            {
              type: 'text',
              text: `Found ${clips.length} clips matching "${query}":\n\n` +
                clips.map((clip, index) => 
                  `${index + 1}. ${clip.title}\n   URL: ${clip.url}\n   Created: ${clip.createdAt}\n   Preview: ${clip.content.substring(0, 200)}...\n`
                ).join('\n'),
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to search clips: ${error.message}`
        );
      }
    }
    
    case 'get_clip': {
      const { clipId, userId } = args;
      
      try {
        const clip = await databases.getDocument(DATABASE_ID, COLLECTION_ID, clipId);
        
        if (clip.userId !== userId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'You can only access your own clips'
          );
        }
        
        const metadata = JSON.parse(clip.metadata || '{}');
        
        return {
          content: [
            {
              type: 'text',
              text: `Title: ${clip.title}\nURL: ${clip.url}\nCreated: ${clip.createdAt}\nType: ${metadata.type || 'unknown'}\n\nContent:\n${clip.content}`,
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get clip: ${error.message}`
        );
      }
    }
    
    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
  }
});

// Main function for Appwrite
module.exports = async ({ req, res, log, error }) => {
  try {
    // Parse the MCP request from the HTTP request body
    const mcpRequest = JSON.parse(req.body || '{}');
    
    // Create a transport for handling the request
    const transport = new StdioServerTransport();
    
    // Process the MCP request
    const response = await server.handleRequest(mcpRequest);
    
    log(`MCP request processed: ${mcpRequest.method}`);
    
    return res.json(response);
    
  } catch (err) {
    error(`MCP server error: ${err.message}`);
    return res.json({ 
      error: {
        code: ErrorCode.InternalError,
        message: err.message
      }
    }, 500);
  }
};