import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.AUTH_DB_NAME);

function collectOrigins() {
  const envOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ].filter(Boolean);

  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...envOrigins,
    "https://recellhub-client.vercel.app",
    "https://*.vercel.app",
  ];
}

function collectAllowedHosts() {
  const hostCandidates = new Set([
    "localhost:3000",
    "127.0.0.1:3000",
    "recellhub-client.vercel.app",
    "*.vercel.app",
  ]);

  for (const value of collectOrigins()) {
    try {
      const url = new URL(value);
      if (url.host) {
        hostCandidates.add(url.host);
      }
    } catch {
      if (typeof value === "string" && value.includes(".")) {
        hostCandidates.add(value.replace(/^https?:\/\//, ""));
      }
    }
  }

  return [...hostCandidates];
}

const trustedOrigins = collectOrigins();

export const auth = betterAuth({
  baseURL: {
    allowedHosts: collectAllowedHosts(),
    protocol: process.env.NODE_ENV === "production" ? "https" : "http",
  },
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  user: {
    additionalFields:{
      role:{
        type: "string",
        defaultValue: "seller",
      },
      phoneNumber:{
        type: "string",
      },
      location:{
        type: "string",
      },
      staus:{
        type: "string",
      }
  
    }
    
  }
});
