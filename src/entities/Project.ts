import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm"
// Circular dep fixes
// import { User } from "./User"
// import { File } from "./File"

@Entity()
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne("User", (user: any) => user.projects)
  owner!: any

  @Column()
  ownerId!: string

  @OneToMany("File", (file: any) => file.project)
  files!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
