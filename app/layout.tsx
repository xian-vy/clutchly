import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";
import { APP_DESCRIPTION, APP_TITLE } from "@/lib/constants/app";

const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  keywords: ["reptile husbandry", "breeding records", "reptile management", "clutchly", "reptile health tracking", "reptile data management"],
  authors: [{ name: "Clutchly Team" }],
  creator: "Clutchly",
  publisher: "Clutchly",
  metadataBase: new URL("https://clutchly.vercel.app"), 
  alternates: {
    canonical: "/",
    languages: {
      'en-US': "/en-us",
    },
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "https://clutchly.vercel.app",
    siteName: "Clutchly",
    images: [
      {
        url: "/og.png", 
        width: 745,
        height: 881,
        alt: APP_TITLE,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/og.png"], 
    creator: "@clutchly", 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-site-verification': 'vVikk-GsXog3O1npUfmjcRoob951D1XWIJ4gOLsBjOQ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
