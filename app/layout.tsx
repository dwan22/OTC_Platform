import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"

const interTight = Inter_Tight({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight"
})

export const metadata: Metadata = {
  title: "OTC Platform - Order to Cash Management",
  description: "Comprehensive Order-to-Cash platform with ASC 606 revenue recognition",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={interTight.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
