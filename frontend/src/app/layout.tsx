import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Multi-Stage Prompt-Agent Fact Checker",
  description:
    "Presentation-ready demo UI for a multi-stage prompt-engineering fact-checking system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="aurora-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]"
            data-variant="blue"
          />
          <div
            className="aurora-orb right-[-8rem] top-[4rem] h-[20rem] w-[20rem]"
            data-variant="teal"
          />
          <div
            className="aurora-orb bottom-[-10rem] left-[20%] h-[18rem] w-[18rem]"
            data-variant="amber"
          />
          <div className="noise-overlay" />
          <div className="grid-fade absolute inset-0" />
        </div>
        {children}
      </body>
    </html>
  );
}
