import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch user content from database
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userContent = await prisma.userContent.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      data: userContent?.data || null,
      version: userContent?.version || 0,
      updatedAt: userContent?.updatedAt || null,
    })
  } catch (error) {
    console.error("Sync GET error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST: Save user content to database
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { data, version } = await request.json()

    // Upsert user content
    const userContent = await prisma.userContent.upsert({
      where: { userId: session.user.id },
      update: {
        data,
        version: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        data,
        version: version || 1,
      },
    })

    return NextResponse.json({
      success: true,
      version: userContent.version,
      updatedAt: userContent.updatedAt,
    })
  } catch (error) {
    console.error("Sync POST error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
