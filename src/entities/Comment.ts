import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { User } from "./User"
import { File } from "./File"

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("text")
  content!: string

  @Column()
  authorId!: string

  @ManyToOne(() => User, (user) => user.comments)
  author!: User

  @Column()
  fileId!: string

  @ManyToOne(() => File, (file) => file.comments)
  file!: File

  @CreateDateColumn()
  createdAt!: Date
}
