import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { User } from "@/entities/User";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const db = await getDb();
  const userCount = await db.getRepository(User).count();
  if (userCount === 0) {
    redirect("/setup");
  } else {
    redirect("/login");
  }
}
