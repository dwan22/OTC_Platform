import { NextResponse } from 'next/server'
import { db } from '@/lib/instant-backend'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.query({ $users: {} })
    const users = result.$users || []
    
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      createdAt: user['created-at'] || user.createdAt,
    }))
    
    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
