"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateKeyForm({ onCreate }: { onCreate: (formData: FormData) => Promise<{ rawKey: string } | undefined> }) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await onCreate(formData);
    if (result && result.rawKey) {
      setNewKey(result.rawKey);
      router.refresh(); // Refresh the list of keys
    }
  }

  return (
    <div>
      {newKey && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
          <p className="font-bold mb-2">New API Key Generated:</p>
          <code className="block p-2 bg-white border rounded text-sm font-mono break-all select-all">
            {newKey}
          </code>
          <p className="text-xs mt-2 text-green-600">
            Copy this key now. You won't be able to see it again!
          </p>
          <button 
            onClick={() => setNewKey(null)}
            className="mt-2 text-sm text-green-700 underline"
          >
            Done
          </button>
        </div>
      )}

      {!newKey && (
        <form action={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Key Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g. CI/CD Pipeline"
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-[42px]"
          >
            Generate Key
          </button>
        </form>
      )}
    </div>
  );
}
