"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="flex flex-col gap-4 w-full max-w-md">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="p-2 border rounded text-black"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="p-2 border rounded text-black"
      />
      <button
        type="submit"
        disabled={isPending}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
      {errorMessage && (
        <p className="text-red-500 text-sm text-center">{errorMessage}</p>
      )}
    </form>
  );
}
