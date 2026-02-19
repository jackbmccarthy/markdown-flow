import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { User, UserRole } from '@/entities/User'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = userSchema.parse(body)

    const db = await getDb()
    const userRepository = db.getRepository(User)

    const userCount = await userRepository.count()
    if (userCount > 0) {
      // In this app, only the first user can register as ADMIN.
      // Subsequent registrations might be disabled or handled differently.
      // The original code returned 403 "Registration disabled" if any user existed.
      return NextResponse.json({ message: 'Registration disabled' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = new User()
    newUser.email = email
    newUser.passwordHash = hashedPassword
    newUser.role = UserRole.ADMIN // First user is admin

    await userRepository.save(newUser)

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
