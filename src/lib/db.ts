import "reflect-metadata"
import { DataSource } from "typeorm"
import { User, Project, File, FileVersion, Comment } from "../entities"

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // Auto-create tables (dev only)
  logging: false,
  entities: [User, Project, File, FileVersion, Comment],
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
