const path = require('path');

// Load .env.test first for test-specific values
require('dotenv').config({ path: path.join(__dirname, '.env.test') });

// Then load main .env for any missing values (e.g., real API keys for integration tests)
require('dotenv').config({ path: path.join(__dirname, '../.env') });