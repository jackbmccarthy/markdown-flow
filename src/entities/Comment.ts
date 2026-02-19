import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
// import { User } from "./User"
// import { File } from "./File"

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("text")
  content!: string

  @Column()
  authorId!: string

  @ManyToOne("User", (user: any) => user.comments)
  author!: any

  @Column()
  fileId!: string

  @Column({ nullable: true })
  lineNumber?: number

  @ManyToOne("File", (file: any) => file.comments)
  file!: any

  @CreateDateColumn()
  createdAt!: Date
}
