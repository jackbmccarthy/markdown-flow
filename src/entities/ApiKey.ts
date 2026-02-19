import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  keyHash!: string

  @Column()
  keyPrefix!: string // To show user e.g. "sk-abc..."

  @Column({ nullable: true })
  name?: string

  @Column()
  userId!: string

  @ManyToOne(() => User, (user) => user.apiKeys)
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
