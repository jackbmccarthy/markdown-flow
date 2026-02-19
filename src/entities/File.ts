import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm"
// Circular fixes
// import { Project } from "./Project"
// import { FileVersion } from "./FileVersion"
// import { Comment } from "./Comment"

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column()
  projectId!: string

  @ManyToOne("Project", (project: any) => project.files)
  project!: any

  @OneToMany("FileVersion", (version: any) => version.file)
  versions!: any[]

  @OneToMany("Comment", (comment: any) => comment.file)
  comments!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
