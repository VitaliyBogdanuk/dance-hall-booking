import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

if (!MONGODB_URL) {
  throw new Error("Missing required environment variable: MONGODB_URL");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectOnce(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const connectionOptions: mongoose.ConnectOptions = {};
    if (MONGODB_DBNAME) {
      connectionOptions.dbName = MONGODB_DBNAME;
    }

    cache.promise = mongoose.connect(MONGODB_URL!, connectionOptions);
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
