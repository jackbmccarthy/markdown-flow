import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { File } from "@/entities/File";
import { User } from "@/entities/User";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email });
  if (!user) redirect("/login");

  const files = await db.getRepository(File).find({
    where: { projectId: params.id },
    order: { createdAt: "DESC" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold">Files</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <Link 
            key={file.id} 
            href={`/dashboard/file/${file.id}`}
            className="block p-6 border rounded hover:shadow-lg transition bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
            <p className="text-gray-500 text-sm">Created: {file.createdAt.toLocaleDateString()}</p>
          </Link>
        ))}
        {files.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No files uploaded yet. Use the API to upload.</p>
        )}
      </div>
    </div>
  );
}
