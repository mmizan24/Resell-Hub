import "server-only";

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const globalForMongo = globalThis;

if (!globalForMongo.resellhubMongoClientPromise) {
  const client = new MongoClient(uri);
  globalForMongo.resellhubMongoClientPromise = client.connect();
}

export const mongoClientPromise = globalForMongo.resellhubMongoClientPromise;

export async function getResellhubDatabase() {
  const client = await mongoClientPromise;
  return client.db("resellhub");
}
