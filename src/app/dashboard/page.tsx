import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email });
  if (!user) redirect("/login");

  const projects = await db.getRepository(Project).find({
    where: { ownerId: user.id },
    order: { createdAt: "DESC" },
  });

  async function createProject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return;

    const db = await getDb();
    const user = await db.getRepository(User).findOneBy({ email: session?.user?.email! });
    
    const project = new Project();
    project.name = name;
    project.owner = user;
    project.ownerId = user!.id;
    
    await db.getRepository(Project).save(project);
    revalidatePath("/dashboard");
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/settings" className="px-4 py-2 bg-gray-200 rounded">Settings</Link>
      </div>

      <div className="mb-8 p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form action={createProject} className="flex gap-4">
          <input
            name="name"
            placeholder="Project Name"
            required
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            href={`/dashboard/project/${project.id}`}
            className="block p-6 border rounded hover:shadow-lg transition bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-500 text-sm">Created: {project.createdAt.toLocaleDateString()}</p>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No projects yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
