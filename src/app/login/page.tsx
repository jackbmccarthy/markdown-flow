import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return "Invalid credentials.";
          default:
            return "Something went wrong.";
        }
      }
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      <form action={login} className="flex flex-col gap-4 w-full max-w-md">
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
        <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Sign In
        </button>
      </form>
    </div>
  );
}
