import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ApiKey } from "@/entities/ApiKey";
import { User } from "@/entities/User";
import { compare } from "bcryptjs";

export async function validateApiKey(req: NextRequest): Promise<User | null> {
  const apiKeyHeader = req.headers.get("x-api-key");
  if (!apiKeyHeader) return null;

  // We look up by prefix (first 10 chars + "...")
  // This assumes we stored it as "prefix..." in the DB.
  // In createApiKey: const prefix = rawKey.substring(0, 10) + "...";
  
  const prefix = apiKeyHeader.substring(0, 10) + "...";
  
  const db = await getDb();
  // Find all keys with this prefix (should be few)
  const candidates = await db.getRepository(ApiKey).find({
    where: { keyPrefix: prefix },
    relations: ["user"]
  });

  for (const key of candidates) {
    // Check full key against hash
    const isValid = await compare(apiKeyHeader, key.keyHash);
    if (isValid) {
      return key.user;
    }
  }

  return null;
}
