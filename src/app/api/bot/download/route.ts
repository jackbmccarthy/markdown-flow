import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { File } from "@/entities/File";
import { FileVersion } from "@/entities/FileVersion";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = await validateApiKey(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectName = req.nextUrl.searchParams.get("projectName");
  const fileName = req.nextUrl.searchParams.get("fileName");

  if (!projectName || !fileName) {
    return NextResponse.json({ error: "Missing projectName or fileName" }, { status: 400 });
  }

  const db = await getDb();
  
  const project = await db.getRepository(Project).findOneBy({
    name: projectName,
    ownerId: user.id,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const file = await db.getRepository(File).findOneBy({
    name: fileName,
    projectId: project.id,
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const version = await db.getRepository(FileVersion).findOne({
    where: { fileId: file.id },
    order: { createdAt: "DESC" },
  });

  if (!version) {
    return NextResponse.json({ error: "No content found" }, { status: 404 });
  }

  return NextResponse.json({
    content: version.content,
    versionId: version.id,
    createdAt: version.createdAt
  });
}
