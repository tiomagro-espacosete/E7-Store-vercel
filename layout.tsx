import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://xn--espao-sete-store-1qb.abacusai.app"),
  title: "ESPAÇO SETE STORE",
  description: "Compre cartões full dados de forma rápida e segura via Pix",
  icons: { icon: "/logo.jpeg", shortcut: "/logo.jpeg", apple: "/logo.jpeg" },
  openGraph: {
    title: "ESPAÇO SETE STORE",
    description: "Compre cartões full dados de forma rápida e segura via Pix",
    siteName: "ESPAÇO SETE STORE",
    url: "https://xn--espao-sete-store-1qb.abacusai.app",
    images: [
      {
        url: "https://xn--espao-sete-store-1qb.abacusai.app/logo.jpeg",
        width: 512,
        height: 512,
        alt: "ESPAÇO SETE STORE",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESPAÇO SETE STORE",
    description: "Compre cartões full dados de forma rápida e segura via Pix",
    images: ["https://xn--espao-sete-store-1qb.abacusai.app/logo.jpeg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
