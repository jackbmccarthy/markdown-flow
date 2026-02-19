import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/User"
import { Project } from "../entities/Project"
import { File } from "../entities/File"
import { FileVersion } from "../entities/FileVersion"
import { Comment } from "../entities/Comment"
import { ApiKey } from "../entities/ApiKey"

// Helper to handle CA Cert from env
const getSslConfig = () => {
  const ca = process.env.DB_CA_CERT;
  if (ca) {
    return {
      rejectUnauthorized: true,
      ca: ca.replace(/\\n/g, '\n'), // Fix newlines if passed as string literal
    };
  }
  // Fallback for dev/local without certs
  return process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined;
};

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: getSslConfig(),
  synchronize: true, // Auto-create tables (dev only)
  logging: false,
  entities: [User, Project, File, FileVersion, Comment, ApiKey],
  migrations: [],
  subscribers: [],
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
      .then(() => {
        console.log("Data Source has been initialized!")
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err)
      })
  }
  return dataSource
}
