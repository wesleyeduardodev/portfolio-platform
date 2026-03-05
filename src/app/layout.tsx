import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fernanda Oliveira | Engenheira Civil & Designer de Interiores",
  description:
    "Transformando espaços em experiências. Projetos de engenharia civil e design de interiores em São Paulo.",
  openGraph: {
    title: "Fernanda Oliveira | Engenheira Civil & Designer de Interiores",
    description:
      "Transformando espaços em experiências. Projetos de engenharia civil e design de interiores.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${cormorant.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
