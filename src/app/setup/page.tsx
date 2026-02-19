import { getDb } from "@/lib/db";
import { User, UserRole } from "@/entities/User";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const db = await getDb();
  const userCount = await db.getRepository(User).count();

  if (userCount > 0) {
    redirect("/login");
  }

  async function registerAdmin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return;

    const db = await getDb();
    const hashedPassword = await hash(password, 10);
    
    const admin = new User();
    admin.email = email;
    admin.passwordHash = hashedPassword;
    admin.role = UserRole.ADMIN;

    await db.getRepository(User).save(admin);
    revalidatePath("/");
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Setup Admin Account</h1>
      <form action={registerAdmin} className="flex flex-col gap-4 w-full max-w-md">
        <input
          name="email"
          type="email"
          placeholder="Admin Email"
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
          Create Admin
        </button>
      </form>
    </div>
  );
}
