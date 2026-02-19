import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm"
import { User } from "./User"
import { File } from "./File"

@Entity()
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne(() => User, (user) => user.projects)
  owner!: User

  @Column()
  ownerId!: string

  @OneToMany(() => File, (file) => file.project)
  files!: File[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
