export default function PrivacyPolicy() {
  return (
    <main style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', lineHeight: 1.7 }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ fontSize: '0.85rem', color: '#9A9AA4', marginBottom: '2rem' }}>Last updated: 23 July 2026</p>

      <p style={{ marginBottom: '1.5rem' }}>
        PolyCast (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides an AI-powered service that transcribes, translates, and dubs video content
        into multiple languages, with the option to publish the resulting videos directly to a creator&apos;s own YouTube channel.
        This policy explains what data we collect, how we use it, and how we protect it.
      </p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>1. Information we collect</h2>
      <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>Account information (name, email) via our authentication provider, Clerk.</li>
        <li style={{ marginBottom: '0.5rem' }}>Video and audio files you upload for transcription, translation, and dubbing.</li>
        <li style={{ marginBottom: '0.5rem' }}>Transcripts and translated text generated from your uploaded content.</li>
        <li style={{ marginBottom: '0.5rem' }}>
          If you connect your Google account, we access basic YouTube channel information and, only when you explicitly click
          &quot;Publish to YouTube&quot;, we use the YouTube Data API to upload the finished video to your own channel.
        </li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>2. How we use your YouTube access</h2>
      <p style={{ marginBottom: '1rem' }}>
        PolyCast requests the <code>youtube.upload</code> permission solely to publish a dubbed or translated video to the
        connected creator&apos;s own YouTube channel, and only when the creator actively chooses to do so by clicking
        &quot;Publish to YouTube&quot; and selecting a visibility setting (Private, Unlisted, or Public). We never upload,
        modify, or delete content on your channel without this explicit, per-video action from you. We do not use this
        access to read, analyze, or share your existing YouTube content beyond what is necessary to publish the new video.
      </p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>3. How we store and protect your data</h2>
      <p style={{ marginBottom: '1rem' }}>
        Uploaded videos and generated content are stored securely using Vercel Blob storage and Supabase, both of which
        employ industry-standard encryption and access controls. Access tokens for connected accounts (such as Google)
        are managed by Clerk and are never exposed to the browser or stored in plain text on our servers.
      </p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>4. Data sharing</h2>
      <p style={{ marginBottom: '1rem' }}>
        We do not sell, rent, or share your personal data or video content with third parties, except where necessary
        to provide the service (for example, sending audio to our transcription and translation providers, or publishing
        a video to YouTube at your explicit request).
      </p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>5. Your choices</h2>
      <p style={{ marginBottom: '1rem' }}>
        You can disconnect your Google account at any time, which immediately revokes PolyCast&apos;s access to your
        YouTube channel. You can also delete any saved video from your PolyCast dashboard at any time.
      </p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }}>6. Contact us</h2>
      <p style={{ marginBottom: '1rem' }}>
        If you have questions about this privacy policy or how your data is handled, contact us at{' '}
        <a href="mailto:tazabbas88@gmail.com" style={{ color: '#1D9E75' }}>tazabbas88@gmail.com</a>.
      </p>
    </main>
  )
}
