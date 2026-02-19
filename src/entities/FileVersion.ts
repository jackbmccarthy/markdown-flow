import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { File } from "./File"

@Entity()
export class FileVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("text")
  content!: string

  @Column()
  fileId!: string

  @ManyToOne(() => File, (file) => file.versions)
  file!: File

  @CreateDateColumn()
  createdAt!: Date
}
