module.exports = {
  QDRANT_URL: process.env.QDRANT_URL || 'http://localhost:6333/',
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || '',
  DATA_DIR: process.env.DATA_DIR || './extracts',
  QDRANT_CODE_COLLECTION_NAME: 'code_snippets',
};
