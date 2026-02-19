import { auth, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { File } from "@/entities/File";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  ChevronRight,
  Plus,
  Search,
  LayoutDashboard,
  Settings,
  LogOut,
  Terminal as TerminalIcon
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email as string });
  if (!user) redirect("/login");

  const project = await db.getRepository(Project).findOneBy({ id });
  if (!project) redirect("/dashboard");

  const files = await db.getRepository(File).find({
    where: { projectId: id },
    order: { createdAt: "DESC" },
  });

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
            className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-border mx-1" />
            <h2 className="font-semibold text-lg">{project.name}</h2>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Project</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Documentation Files</h1>
              <p className="text-muted-foreground">Manage and review markdown files for this project.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  placeholder="Search files..."
                  className="bg-secondary/50 border border-border/50 rounded-xl h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
                />
              </div>
              <button className="h-10 px-4 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" />
                <span>UPLOAD</span>
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/30">
              <div className="col-span-6">File Name</div>
              <div className="col-span-3">Created At</div>
              <div className="col-span-2">Version</div>
              <div className="col-span-1"></div>
            </div>

            {files.map((file) => (
              <Link
                key={file.id}
                href={`/dashboard/file/${file.id}`}
                className="grid grid-cols-12 items-center px-6 py-4 bg-secondary/20 border border-border/30 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group glass"
              >
                <div className="col-span-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <span className="text-white font-semibold group-hover:text-primary transition-colors block">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[200px] block">
                      ID: {file.id}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{file.createdAt.toLocaleDateString()}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted-foreground group-hover:border-primary/20 group-hover:text-primary transition-all">
                    v1.0.0
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}

            {files.length === 0 && (
              <div className="py-20 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground opacity-20" />
                </div>
                <p className="text-muted-foreground max-w-xs text-sm">
                  No files uploaded yet for this project. Use the bot API to start the flow.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
