import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['video/*', 'audio/*'],
          addRandomSuffix: true,
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB ceiling
        }
      },
      onUploadCompleted: async () => {
        // No server-side action needed after upload completes for now
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Blob upload token error:', error)
    return NextResponse.json({ error: 'Failed to authorize upload' }, { status: 400 })
  }
}
