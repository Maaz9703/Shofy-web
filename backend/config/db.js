const mongoose = require('mongoose');

/**
 * MongoDB connection with caching for serverless (Vercel): each invocation reuses
 * the same connection instead of opening new sockets every time.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }
  const g = global.mongoose;

  if (g.conn) {
    return g.conn;
  }

  if (!g.promise) {
    g.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    g.conn = await g.promise;
  } catch (err) {
    g.promise = null;
    throw err;
  }

  return g.conn;
}

module.exports = connectDB;
