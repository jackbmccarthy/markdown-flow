import "reflect-metadata"
import { DataSource } from "typeorm"
import { User, UserRole } from "../entities/User"
import { Project } from "../entities/Project"
import { File } from "../entities/File"
import { FileVersion } from "../entities/FileVersion"
import { Comment } from "../entities/Comment"
import { ApiKey } from "../entities/ApiKey"

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "markdown_flow.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Project, File, FileVersion, Comment, ApiKey],
})

let dataSource: DataSource = AppDataSource

if (process.env.NODE_ENV !== "production") {
  if (!(global as any).dataSource) {
    (global as any).dataSource = AppDataSource
  }
  dataSource = (global as any).dataSource
}

export const getDb = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
      .then(async () => {
        console.log("Data Source has been initialized (SQLite)!")
        
        // Ensure Admin user exists in DB
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const repo = dataSource.getRepository(User);
        const admin = await repo.findOneBy({ email: adminUsername });
        if (!admin) {
          const newAdmin = new User();
          newAdmin.email = adminUsername;
          newAdmin.passwordHash = "ENV_AUTH";
          newAdmin.role = UserRole.ADMIN;
          await repo.save(newAdmin);
          console.log("Admin user created in SQLite DB");
        }
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err)
      })
  }
  return dataSource
}
