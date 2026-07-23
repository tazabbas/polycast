import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const { videoId, title, description, privacyStatus } = await req.json();

    if (!videoId || !title || !privacyStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clerkClient();
    const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'google');
    const accessToken = tokenResponse.data[0]?.token;

    if (!accessToken) {
      return NextResponse.json({ error: 'No Google account connected' }, { status: 400 });
    }

    const { data: videoRow, error: fetchError } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !videoRow) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const videoFileRes = await fetch(videoRow.video_url);
    if (!videoFileRes.ok) {
      return NextResponse.json({ error: 'Could not fetch video file' }, { status: 500 });
    }
    const videoBuffer = Buffer.from(await videoFileRes.arrayBuffer());

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: description || '',
        },
        status: {
          privacyStatus,
        },
      },
      media: {
        body: bufferToStream(videoBuffer),
      },
    });

    const youtubeVideoId = uploadResponse.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    const { error: updateError } = await supabase
      .from('saved_videos')
      .update({
        youtube_video_id: youtubeVideoId,
        youtube_url: youtubeUrl,
        youtube_privacy_status: privacyStatus,
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Supabase update failed:', updateError);
    }

    return NextResponse.json({ success: true, youtubeUrl, youtubeVideoId });
  } catch (err) {
    console.error('YouTube upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
