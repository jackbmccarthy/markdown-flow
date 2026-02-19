"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Key, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateKeyForm({ onCreate }: { onCreate: (formData: FormData) => Promise<{ rawKey: string } | undefined> }) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await onCreate(formData);
    if (result && result.rawKey) {
      setNewKey(result.rawKey);
      router.refresh();
    }
  }

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {newKey ? (
        <div className="animate-in zoom-in-95 duration-300">
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Check className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">Secret Key Generated</span>
            </div>
            
            <div className="relative group mb-4">
              <code className="block p-4 bg-background border border-primary/20 rounded-xl text-xs font-mono break-all pr-12 text-white">
                {newKey}
              </code>
              <button 
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-primary"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-muted-foreground/80 uppercase tracking-tight">
                Store this key securely. It will not be shown again. Revoking this key will immediately terminate all associated bot sessions.
              </p>
            </div>

            <button 
              onClick={() => setNewKey(null)}
              className="mt-6 w-full h-11 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Confirm and Close
            </button>
          </div>
        </div>
      ) : (
        <form action={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              name="name"
              type="text"
              placeholder="Identifier (e.g. Pi-Agent-01)"
              required
              className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
            />
          </div>
          <button 
            type="submit" 
            className="h-12 px-8 bg-white text-black font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98] shrink-0"
          >
            PROVISION
          </button>
        </form>
      )}
    </div>
  );
}
