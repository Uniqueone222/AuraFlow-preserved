#!/usr/bin/env node

/**
 * Initialize Qdrant collection for AuraFlow memory storage
 * Run this script once to set up the vector database collection
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import chalk from "chalk";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || "qdrant-api-key-123";
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "auraflow_memory";

async function initializeCollection() {
  try {
    console.log(chalk.cyan.bold("\n🚀 INITIALIZING QDRANT COLLECTION\n"));

    const client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY
    });

    console.log(chalk.cyan(`Connecting to Qdrant at ${QDRANT_URL}...`));

    // Check if collection already exists
    try {
      const collections = await client.getCollections();
      const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

      if (exists) {
        console.log(chalk.yellow(`⚠ Collection '${COLLECTION_NAME}' already exists.`));
        console.log(chalk.gray("Skipping initialization."));
        process.exit(0);
      }
    } catch (error: any) {
      console.error(chalk.red("Failed to check collections:"), error.message);
      process.exit(1);
    }

    // Create collection with vector configuration
    console.log(chalk.cyan(`\nCreating collection '${COLLECTION_NAME}'...`));

    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384, // Xenova/all-MiniLM-L6-v2 embedding dimension
        distance: "Cosine"
      }
    });

    console.log(chalk.green(`✓ Collection '${COLLECTION_NAME}' created successfully!`));

    // Verify collection was created
    const collections = await client.getCollections();
    const collection = collections.collections.find(c => c.name === COLLECTION_NAME);

    if (collection) {
      console.log(chalk.green(`\n✓ Verified collection exists:`));
      console.log(chalk.cyan(`  Name: ${collection.name}`));
      console.log(chalk.cyan(`  Vector size: 384`));
      console.log(chalk.cyan(`  Distance metric: Cosine`));
    }

    console.log(chalk.green.bold("\n✓ Qdrant collection initialized successfully!\n"));
    console.log(chalk.gray("You can now run workflows with persistent memory enabled."));
    console.log(chalk.gray("Use: auraflow query <search-term> to retrieve memories\n"));

    process.exit(0);
  } catch (error: any) {
    console.error(chalk.red("\n✘ Initialization failed:"), error.message);
    console.error(chalk.red("Error details:"), error);
    process.exit(1);
  }
}

initializeCollection();
