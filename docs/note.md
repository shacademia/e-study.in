### Prisma Client
- use

`
import { prisma } from '@/lib/db'
`
to use Database.

## Example using DB

`
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.create({
    data: { email, password },
  })

  return NextResponse.json({ user })
}
`

### Extract JWT in Next
- we get cookies from headers

`
import { cookies } from 'next/headers'
  # Extracting Token here
 const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

`