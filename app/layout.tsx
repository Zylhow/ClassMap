import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Lado Oculto das Energias Renováveis",
  description: "Critical minerals world map — mines, metals, and the hidden cost of the energy transition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
