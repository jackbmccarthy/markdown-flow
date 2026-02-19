import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Project } from "./Project"
import { Comment } from "./Comment"

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  passwordHash!: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[]

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[]
}
