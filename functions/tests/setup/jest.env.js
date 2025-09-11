// Load environment variables for tests
require('dotenv').config();

// Set test environment variables
process.env.USE_TEST_LLM_MOCK = 'true';
process.env.LLM_PROVIDER = 'gemini';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.SKIP_AUTH = 'true';
process.env.LOCAL_USER_ID = 'test-user-123';
process.env.USE_LOCAL_FIRESTORE_MOCK = 'true';