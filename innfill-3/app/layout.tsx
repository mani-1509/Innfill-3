import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INNFILL - Connect, Create, Collaborate",
  description: "The ultimate platform for freelancers and clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
