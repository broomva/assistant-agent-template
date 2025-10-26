import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

// Create a persistent memory store using LibSQL
export const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
});
