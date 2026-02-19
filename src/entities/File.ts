import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm"
import { Project } from "./Project"
import { FileVersion } from "./FileVersion"
import { Comment } from "./Comment"

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column()
  projectId!: string

  @ManyToOne(() => Project, (project) => project.files)
  project!: Project

  @OneToMany(() => FileVersion, (version) => version.file)
  versions!: FileVersion[]

  @OneToMany(() => Comment, (comment) => comment.file)
  comments!: Comment[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
