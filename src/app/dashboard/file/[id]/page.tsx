import { auth, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { File } from "@/entities/File";
import { User } from "@/entities/User";
import { Comment } from "@/entities/Comment";
import { FileVersion } from "@/entities/FileVersion";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import MarkdownViewer from "@/components/MarkdownViewer";
import {
  ArrowLeft,
  Settings,
  LogOut,
  LayoutDashboard,
  Terminal as TerminalIcon,
  Activity,
  History,
  MessageSquare
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email as string });
  if (!user) redirect("/login");

  const file = await db.getRepository(File).findOneBy({ id });
  if (!file) redirect("/dashboard");

  const versions = await db.getRepository(FileVersion).find({
    where: { fileId: file.id },
    order: { createdAt: "DESC" },
  });

  const content = versions.length > 0 ? versions[0].content : "No content available.";

  const comments = await db.getRepository(Comment).find({
    where: { fileId: file.id },
    relations: ["author"],
    order: { createdAt: "ASC" },
  });

  const formattedComments = comments.map(c => ({
    id: c.id,
    lineNumber: c.lineNumber,
    content: c.content,
    author: { email: (c.author as any).email },
    createdAt: c.createdAt.toISOString(),
  }));

  async function addComment(lineNumber: number, content: string) {
    "use server";
    if (!content) return;
    const session = await auth();
    const user = await getDb().then(db => db.getRepository(User).findOneBy({ email: session?.user?.email as string }));

    if (user) {
      const comment = new Comment();
      comment.content = content;
      comment.lineNumber = lineNumber;
      comment.fileId = id;
      comment.author = user;
      comment.authorId = user.id;

      const db = await getDb();
      await db.getRepository(Comment).save(comment);
      revalidatePath(`/dashboard/file/${id}`);
    }
  }

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 border-r border-border/50 bg-secondary/30 flex flex-col items-center py-6 gap-8 glass">
        <Link href="/dashboard" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:opacity-80 transition-all">
          <TerminalIcon className="w-6 h-6 text-primary-foreground" />
        </Link>

        <nav className="flex-1 flex flex-col gap-4">
          <Link href="/dashboard" title="Dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <Link href={`/dashboard/project/${file.projectId}`} title="Project Files" className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/10 text-accent transition-all border border-accent/20">
            <Activity className="w-5 h-5" />
          </Link>
          <Link href="/settings" title="Settings" className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </nav>

        <form action={handleSignOut}>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={`/dashboard/project/${file.projectId}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-border shrink-0" />
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold text-lg text-white truncate">{file.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <History className="w-2 h-2" /> v{versions.length}.0
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                  <MessageSquare className="w-2 h-2" /> {comments.length} Comments
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-9 px-4 bg-secondary border border-border/50 rounded-lg text-xs font-bold hover:bg-secondary/80 transition-all uppercase tracking-wider">
              Download
            </button>
            <button className="h-9 px-4 bg-white text-black rounded-lg text-xs font-bold hover:opacity-90 transition-all uppercase tracking-wider">
              Approve
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-[#0d0f14]">
          <MarkdownViewer
            content={content}
            comments={formattedComments}
            onAddComment={addComment}
          />
        </div>
      </div>
    </div>
  );
}
