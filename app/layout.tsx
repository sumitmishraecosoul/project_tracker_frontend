import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import BackendUrlDebug from "../components/BackendUrlDebug";
import { BrandProvider } from "../components/BrandContext";
import { BrandUserProvider } from "../components/BrandUserContext";
import { ProjectProvider } from "../components/ProjectContext";
import { TaskProvider } from "../components/TaskContext";
import { SubtaskProvider } from "../components/SubtaskContext";
import { AuthProvider } from "../lib/contexts/AuthContext";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Manager",
  description: "Project and Task Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        <AuthProvider>
          <BrandProvider>
            <BrandUserProvider>
              <ProjectProvider>
                <TaskProvider>
                  <SubtaskProvider>
                    {children}
                    <BackendUrlDebug />
                  </SubtaskProvider>
                </TaskProvider>
              </ProjectProvider>
            </BrandUserProvider>
          </BrandProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
