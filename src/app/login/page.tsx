import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  async function action(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=Invalid credentials");
      }
      throw error; // Let Next.js handle redirects thrown by signIn
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0c10] text-white">
      <div className="w-full max-w-md p-8 bg-[#1a1d23] rounded-2xl border border-[#2d3139] shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 font-mono text-center tracking-tighter">
          MARKDOWN_FLOW LOGIN
        </h1>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
            <input
              name="username"
              type="text"
              required
              className="p-3 bg-[#0a0c10] border border-[#2d3139] rounded-lg focus:outline-none focus:border-[#00ff88] text-white font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input
              name="password"
              type="password"
              required
              className="p-3 bg-[#0a0c10] border border-[#2d3139] rounded-lg focus:outline-none focus:border-[#00ff88] text-white font-mono"
            />
          </div>

          {params.error && (
            <p className="text-red-500 text-sm text-center font-mono">{params.error}</p>
          )}

          <button
            type="submit"
            className="mt-4 p-3 bg-[#00ff88] text-[#0a0c10] font-bold rounded-lg hover:bg-[#00e67a] transition-colors uppercase tracking-widest text-xs"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
