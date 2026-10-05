import "./globals.css"
import type { Metadata } from "next"
import { EchoProvider } from "@/src/app/providers/echo-provider"

export const metadata: Metadata = {
  title: "Echo | Engineering evidence intelligence",
  description: "A high-fidelity prototype connecting AI-assisted engineering activity to delivery, quality, and customer outcomes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="antialiased"
    >
      <body><EchoProvider>{children}</EchoProvider></body>
    </html>
  )
}
