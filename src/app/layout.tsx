import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});


const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pmiiuinsgd.or.id";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PMII UIN SGD Cabang Kabupaten Bandung",
    template: "%s | PMII UIN SGD Cabang Kabupaten Bandung",
  },
  description:
    "Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
  keywords: ["PMII", "BIMTES", "UIN Bandung", "Pergerakan", "Kabupaten Bandung", "Aswaja"],
  authors: [{ name: "PMII Komisariat UIN SGD Bandung" }],
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
  openGraph: {
    title: "PK PMII UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
    description:
      "Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
    url: baseUrl,
    siteName: "PK PMII UIN SGD Bandung",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 800,
        alt: "Logo PK PMII UIN SGD Bandung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PK PMII UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
    description:
      "Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
    images: ["/icon.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: "googlebf0ada345c2b6345",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="googlebf0ada345c2b6345" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
