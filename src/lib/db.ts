import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { User, UserRole } from "../entities/User"
import { Project } from "../entities/Project"
import { File } from "../entities/File"
import { FileVersion } from "../entities/FileVersion"
import { Comment } from "../entities/Comment"
import { ApiKey } from "../entities/ApiKey"

const entities = [User, Project, File, FileVersion, Comment, ApiKey];

const getOptions = (): DataSourceOptions => {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    return {
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=no-verify') 
        ? { rejectUnauthorized: false } 
        : false,
      synchronize: true,
      logging: false,
      entities,
    };
  }
  
  return {
    type: "sqlite",
    database: "markdown_flow.sqlite",
    synchronize: true,
    logging: false,
    entities,
  };
};

const AppDataSource = new DataSource(getOptions());

let dataSource: DataSource = AppDataSource;

if (process.env.NODE_ENV !== "production") {
  if (!(global as any).dataSource) {
    (global as any).dataSource = AppDataSource;
  }
  dataSource = (global as any).dataSource;
}

export const getDb = async () => {
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize();
      console.log(`Data Source has been initialized (${dataSource.options.type})!`);
      
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
        console.log(`Admin user created in ${dataSource.options.type} DB`);
      }
    } catch (err) {
      console.error("Error during Data Source initialization", err);
      throw err; // Re-throw to prevent use of uninitialized connection
    }
  }
  return dataSource;
}
