import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { File } from "@/entities/File";
import { FileVersion } from "@/entities/FileVersion";
import { validateApiKey } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = await validateApiKey(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, name, projectName } = await req.json();

    if (!content || !name || !projectName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    
    // Find project
    let project = await db.getRepository(Project).findOneBy({
      name: projectName,
      ownerId: user.id,
    });

    if (!project) {
      // Create project if not exists
      project = new Project();
      project.name = projectName;
      project.owner = user;
      project.ownerId = user.id;
      await db.getRepository(Project).save(project);
    }

    // Find file
    let file = await db.getRepository(File).findOneBy({
      name: name,
      projectId: project.id,
    });

    if (!file) {
      // Create file
      file = new File();
      file.name = name;
      file.project = project;
      file.projectId = project.id;
      await db.getRepository(File).save(file);
    }

    // Create version
    const version = new FileVersion();
    version.content = content;
    version.file = file;
    version.fileId = file.id;
    await db.getRepository(FileVersion).save(version);

    return NextResponse.json({ 
      success: true, 
      projectId: project.id, 
      fileId: file.id, 
      versionId: version.id 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
