import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jamuhuri Gachoroba",
  description: "Author & Podcast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}