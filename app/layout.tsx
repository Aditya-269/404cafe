import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "404 Café: The Most Buggy Café on the Internet",
  description: "A website so broken, even your coffee will crash!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider defaultTheme="light" enableSystem disableTransitionOnChange>
  {children}
  <Toaster />
</ThemeProvider>

      </body>
    </html>
  )
}

