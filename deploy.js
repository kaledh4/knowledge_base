const { Client, Databases, Functions, Users, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const client = new Client();
const databases = new Databases(client);
const functions = new Functions(client);
const users = new Users(client);

// Configure Appwrite client
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'clips-db';
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID || 'clips';

async function createDatabase() {
  try {
    console.log('Creating database...');
    const database = await databases.create(DATABASE_ID, 'Clips Database');
    console.log(`✅ Database created: ${database.$id}`);
    return database;
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Database already exists');
      return await databases.get(DATABASE_ID);
    }
    throw error;
  }
}

async function createCollection() {
  try {
    console.log('Creating collection...');
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Clips',
      [
        'read("user:[USER_ID]")',
        'write("user:[USER_ID]")',
        'delete("user:[USER_ID]")',
      ]
    );
    console.log(`✅ Collection created: ${collection.$id}`);
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Collection already exists');
      return await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    }
    throw error;
  }
}

async function createAttributes() {
  console.log('Creating attributes...');
  
  const attributes = [
    { key: 'url', type: 'string', size: 2048, required: true },
    { key: 'title', type: 'string', size: 255, required: true },
    { key: 'content', type: 'string', size: 1000000, required: true },
    { key: 'metadata', type: 'string', size: 10000, required: false },
    { key: 'userId', type: 'string', size: 36, required: true },
    { key: 'createdAt', type: 'datetime', required: true },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.required
        );
      }
      console.log(`✅ Attribute created: ${attr.key}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`✅ Attribute already exists: ${attr.key}`);
      } else {
        console.error(`❌ Failed to create attribute ${attr.key}:`, error.message);
      }
    }
  }
}

async function createIndexes() {
  console.log('Creating indexes...');
  
  const indexes = [
    { key: 'userId_index', type: 'key', attributes: ['userId'] },
    { key: 'createdAt_index', type: 'key', attributes: ['createdAt'] },
    { key: 'title_search', type: 'fulltext', attributes: ['title'] },
    { key: 'content_search', type: 'fulltext', attributes: ['content'] },
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        index.key,
        index.type,
        index.attributes
      );
      console.log(`✅ Index created: ${index.key}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`✅ Index already exists: ${index.key}`);
      } else {
        console.error(`❌ Failed to create index ${index.key}:`, error.message);
      }
    }
  }
}

async function deployFunction(functionName) {
  const functionPath = path.join(__dirname, 'functions', functionName);
  const configPath = path.join(functionPath, 'appwrite.json');
  
  if (!fs.existsSync(configPath)) {
    console.log(`❌ Configuration file not found: ${configPath}`);
    return;
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const functionConfig = config.functions[0];
  
  try {
    console.log(`Deploying function: ${functionName}...`);
    
    // Create or update function
    let func;
    try {
      func = await functions.get(functionConfig.$id);
      console.log(`✅ Function exists: ${functionConfig.$id}`);
    } catch (error) {
      if (error.code === 404) {
        func = await functions.create(
          functionConfig.$id,
          functionConfig.name,
          functionConfig.runtime,
          functionConfig.execute,
          functionConfig.events,
          functionConfig.schedule,
          functionConfig.timeout,
          functionConfig.enabled,
          functionConfig.logging
        );
        console.log(`✅ Function created: ${func.$id}`);
      } else {
        throw error;
      }
    }
    
    // Set environment variables
    const variables = {
      ...functionConfig.variables,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_DATABASE_ID: DATABASE_ID,
      APPWRITE_COLLECTION_ID: COLLECTION_ID,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    };
    
    for (const [key, value] of Object.entries(variables)) {
      try {
        await functions.createVariable(functionConfig.$id, key, value);
        console.log(`✅ Variable set: ${key}`);
      } catch (error) {
        if (error.code === 409) {
          await functions.updateVariable(functionConfig.$id, key, key, value);
          console.log(`✅ Variable updated: ${key}`);
        } else {
          console.error(`❌ Failed to set variable ${key}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Function ${functionName} deployed successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to deploy function ${functionName}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Appwrite deployment...');
    
    // Create database and collection
    await createDatabase();
    await createCollection();
    
    // Wait a bit for collection to be ready
    console.log('⏳ Waiting for collection to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createAttributes();
    
    // Wait for attributes to be ready
    console.log('⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await createIndexes();
    
    // Deploy functions
    await deployFunction('scrape');
    await deployFunction('mcp');
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the correct IDs');
    console.log('2. Deploy function code using Appwrite CLI or dashboard');
    console.log('3. Test the functions through the dashboard');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createDatabase,
  createCollection,
  createAttributes,
  createIndexes,
  deployFunction,
};