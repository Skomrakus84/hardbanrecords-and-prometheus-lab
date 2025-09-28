require('dotenv').config();

let pool;
let mockDb = {
  users: [],
  releases: [],
  tracks: [],
  artists: [],
  books: [],
  chapters: []
};

try {
  const { Pool } = require('pg');

  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    console.log('PostgreSQL connection initialized');
  } else {
    console.warn('DATABASE_URL not found, using mock database');
    pool = null;
  }
} catch (error) {
  console.warn('Failed to initialize PostgreSQL connection:', error.message);
  console.warn('Using mock database instead');
  pool = null;
}

module.exports = {
  query: (text, params) => {
    if (pool) {
      return pool.query(text, params);
    } else {
      console.log('Mock query:', text);
      // Return mock data for development
      return Promise.resolve({
        rows: [],
        rowCount: 0
      });
    }
  },
};
