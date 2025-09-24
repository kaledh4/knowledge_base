import { Client, Account, Databases, Functions } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'demo-project-123');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'clips-db';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'clips';

// Function IDs
export const SCRAPE_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SCRAPE_FUNCTION_ID || 'scrape';
export const MCP_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MCP_FUNCTION_ID || 'mcp-server';

export default client;