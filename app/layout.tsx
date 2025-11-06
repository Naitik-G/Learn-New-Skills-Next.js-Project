// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalHeader from "@/components/ConditionalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://learnhub.com'), // Replace with your actual domain
  title: {
    default: "LearnHub - Master English with AI-Powered Interactive Learning",
    template: "%s | LearnHub"
  },
  description: "Master English through interactive reading, vocabulary building, pronunciation practice, and engaging quizzes. Track your progress with AI-powered analytics and personalized learning paths.",
  keywords: [
    "English learning",
    "language learning platform",
    "vocabulary builder",
    "pronunciation practice",
    "interactive reading",
    "English quiz",
    "AI learning",
    "progress tracking",
    "language education",
    "online English courses",
    "ESL learning",
    "English grammar",
    "speaking practice"
  ],
  authors: [{ name: "LearnHub Team" }],
  creator: "LearnHub",
  publisher: "LearnHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://learnhub.com",
    title: "LearnHub - Master English with AI-Powered Interactive Learning",
    description: "Master English through interactive reading, vocabulary building, pronunciation practice, and engaging quizzes. Track your progress with AI-powered analytics.",
    siteName: "LearnHub",
    images: [
      {
        url: "banner.png", // Create this image (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: "LearnHub - Interactive Language Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnHub - Master English with AI-Powered Interactive Learning",
    description: "Master English through interactive reading, vocabulary building, pronunciation practice, and engaging quizzes.",
    images: ["/banner.png"], // Create this image (1200x600px recommended)
    creator: "@learnhub", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-verification-code", // Get from Google Search Console
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "https://learnhub.com",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Additional SEO tags */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LearnHub",
              url: "https://learnhub.com",
              logo: "/logo.png",
              description: "AI-powered interactive language learning platform",
              sameAs: [
                "https://twitter.com/learnhub",
                "https://facebook.com/learnhub",
                "https://linkedin.com/company/learnhub",
              ],
            }),
          }}
        />
        
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "LearnHub",
              url: "https://learnhub.com",
              description: "Master English through interactive learning",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://learnhub.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        
        {/* Structured Data - EducationalOrganization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "LearnHub",
              description: "Interactive platform for learning English with AI-powered tools",
              url: "https://learnhub.com",
              logo: "/logo.png",
              offers: {
                "@type": "Offer",
                category: "Education",
                availability: "https://schema.org/OnlineOnly",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AuthProvider>
          <ConditionalHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}