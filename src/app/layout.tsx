import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
