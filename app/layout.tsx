import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyCast — Your voice. Every language. Zero effort.",
  description: "PolyCast uses AI to transcribe, translate, and dub your YouTube videos in your own cloned voice — automatically uploaded back to your channel in every language you choose.",
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
