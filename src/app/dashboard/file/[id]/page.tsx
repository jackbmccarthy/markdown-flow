import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { File } from "@/entities/File";
import { User } from "@/entities/User";
import { Comment } from "@/entities/Comment";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import MarkdownViewer from "@/components/MarkdownViewer";

export const dynamic = "force-dynamic";

export default async function FilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email: session.user.email });
  if (!user) redirect("/login");

  const file = await db.getRepository(File).findOneBy({ id: params.id });
  if (!file) redirect("/dashboard");

  const versions = await db.getRepository("FileVersion").find({
    where: { fileId: file.id },
    order: { createdAt: "DESC" },
  });

  const content = versions.length > 0 ? versions[0].content : "No content";

  const comments = await db.getRepository(Comment).find({
    where: { fileId: file.id },
    relations: ["author"],
    order: { createdAt: "ASC" },
  });

  // Transform comments to match interface
  const formattedComments = comments.map(c => ({
    id: c.id,
    lineNumber: c.lineNumber,
    content: c.content,
    author: { email: c.author.email },
    createdAt: c.createdAt.toISOString(),
  }));

  async function addComment(lineNumber: number, content: string) {
    "use server";
    if (!content) return;
    const session = await auth();
    if (!session?.user?.email) return;

    const db = await getDb();
    const user = await db.getRepository(User).findOneBy({ email: session.user.email });
    
    const comment = new Comment();
    comment.content = content;
    comment.lineNumber = lineNumber;
    comment.fileId = params.id;
    comment.author = user;
    comment.authorId = user!.id;
    
    await db.getRepository(Comment).save(comment);
    revalidatePath(`/dashboard/file/${params.id}`);
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Link href={`/dashboard/project/${file.projectId}`} className="text-blue-500 hover:underline text-sm mb-1 inline-block">&larr; Back to Project</Link>
          <h1 className="text-2xl font-bold">{file.name}</h1>
        </div>
        <div className="text-sm text-gray-500">
          v{versions.length}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MarkdownViewer 
          content={content} 
          comments={formattedComments} 
          onAddComment={addComment} 
        />
      </div>
    </div>
  );
}
