import { auth, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  Plus,
  Folder,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  Terminal as TerminalIcon,
  LayoutDashboard
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  // Using email as username/identifier
  const user = await db.getRepository(User).findOneBy({ email: session.user.email });
  if (!user) {
    console.error("User not found in DB for session:", session.user.email);
    redirect("/login");
  }

  const projects = await db.getRepository(Project).find({
    where: { ownerId: user.id },
    order: { createdAt: "DESC" },
  });

  async function createProject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return;

    const db = await getDb();
    const session = await auth();
    const user = await db.getRepository(User).findOneBy({ email: session?.user?.email as string });

    if (user) {
      const project = new Project();
      project.name = name;
      project.owner = user;
      project.ownerId = user.id;
      await db.getRepository(Project).save(project);
      revalidatePath("/dashboard");
    }
  }

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-secondary/30 hidden lg:flex flex-col glass">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TerminalIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold tracking-tighter text-lg">MF_FLOW</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border/50">
          <form action={handleSignOut}>
            <button className="flex items-center gap-3 px-4 py-2 w-full text-muted-foreground hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">Project Dashboard</h2>
            <div className="h-4 w-px bg-border mx-2" />
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
              USER: {session.user.email}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/settings" className="lg:hidden text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Create Section */}
          <section className="mb-12">
            <div className="bg-secondary/50 border border-border/50 rounded-2xl p-6 glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Initialize Project</h3>
                  <p className="text-sm text-muted-foreground">Create a new workspace for markdown reviews.</p>
                </div>
              </div>

              <form action={createProject} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    name="name"
                    placeholder="repository-name-or-title"
                    required
                    className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-8 bg-white text-black font-bold rounded-xl hover:bg-accent hover:text-white transition-all active:scale-[0.98] shrink-0"
                >
                  CREATE_PROJECT
                </button>
              </form>
            </div>
          </section>

          {/* Projects Grid */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Active Projects [{projects.length}]
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  className="group relative"
                >
                  <div className="h-full bg-secondary/30 border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.05)] glass">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Folder className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{project.createdAt.toLocaleDateString()}</span>
                    </div>

                    {/* Progress indicator (placeholder) */}
                    <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded">Active</span>
                    </div>
                  </div>
                </Link>
              ))}

              {projects.length === 0 && (
                <div className="col-span-full py-20 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-muted-foreground max-w-xs">
                    No active projects found. Initialize your first project to get started.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
