// scripts/mongo-init.js
// Run automatically by MongoDB on first container start
// Creates the tunnel database with proper indexes

db = db.getSiblingDB('tunnel');

// Create users collection with indexes
db.createCollection('users');
db.users.createIndex({ githubId: 1 }, { unique: true });
db.users.createIndex({ apiKeyHash: 1 });

print('MongoDB initialized: tunnel database ready');
