import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    'MONGODB_URI environment variable is not defined. Please create .env.local with MONGODB_URI=mongodb://localhost:27017/hackman-v8'
  );
  // Return a mock connection for build time
  return Promise.resolve();
}

// In a serverless environment, you want to reuse the database connection
// across multiple function invocations rather than opening a new one each time.
// We cache the connection on the global object for this purpose.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If we have a cached connection, use it
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no connection promise in the cache, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  // Wait for the connection promise to resolve and cache the connection object
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;