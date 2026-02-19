import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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

    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return NextResponse.json({ message: 'Registration disabled' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'ADMIN', // First user is admin
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
