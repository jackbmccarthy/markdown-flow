import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { User } from "@/entities/User";
import { ApiKey } from "@/entities/ApiKey";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import CreateKeyForm from "./create-key-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email });
  if (!user) redirect("/login");

  const apiKeys = await db.getRepository(ApiKey).find({
    where: { userId: user.id },
    order: { createdAt: "DESC" },
  });

  async function createApiKey(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return { rawKey: "" };

    const db = await getDb();
    const user = await db.getRepository(User).findOneBy({ email: session?.user?.email! });
    
    // Generate key
    const rawKey = "sk-" + randomBytes(32).toString("hex");
    const hashedKey = await hash(rawKey, 10);
    const prefix = rawKey.substring(0, 10) + "...";

    const apiKey = new ApiKey();
    apiKey.name = name;
    apiKey.keyHash = hashedKey;
    apiKey.keyPrefix = prefix;
    apiKey.user = user!;
    apiKey.userId = user!.id;
    
    await db.getRepository(ApiKey).save(apiKey);
    revalidatePath("/settings");
    
    return { rawKey };
  }

  async function revokeApiKey(id: string) {
    "use server";
    const db = await getDb();
    await db.getRepository(ApiKey).delete({ id, userId: user!.id });
    revalidatePath("/settings");
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link href="/dashboard" className="text-blue-500 hover:underline">Back to Dashboard</Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Create New API Key</h2>
        <p className="text-gray-500 mb-6 text-sm">
          API keys allow you to authenticate with the API programmatically. Keep them secret!
        </p>
        <CreateKeyForm onCreate={createApiKey} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Your API Keys</h2>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-sm italic py-4 text-center">No API keys generated yet.</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="flex justify-between items-center p-4 border rounded bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{key.name}</div>
                  <div className="text-xs font-mono text-gray-500 mt-1 bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded w-fit">{key.keyPrefix}</div>
                  <div className="text-xs text-gray-400 mt-1">Created: {key.createdAt.toLocaleDateString()}</div>
                </div>
                <form action={revokeApiKey.bind(null, key.id)}>
                  <button 
                    type="submit" 
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 border border-red-200 hover:bg-red-50 rounded transition-colors"
                    onClick={(e) => {
                      if(!confirm("Are you sure you want to revoke this key?")) e.preventDefault();
                    }}
                  >
                    Revoke
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
