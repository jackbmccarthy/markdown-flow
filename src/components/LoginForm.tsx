"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import { LogIn, User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <User className="w-5 h-5" />
          </div>
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            autoComplete="username"
            className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
          />
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "h-14 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          isPending && "animate-pulse"
        )}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>AUTHENTICATE</span>
          </>
        )}
      </button>
    </form>
  );
}
