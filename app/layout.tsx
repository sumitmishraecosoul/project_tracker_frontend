import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "../components/BrandContext";
import { BrandUserProvider } from "../components/BrandUserContext";
import { ProjectProvider } from "../components/ProjectContext";
import { TaskProvider } from "../components/TaskContext";
import { SubtaskProvider } from "../components/SubtaskContext";
import { NotificationProvider } from "../components/NotificationContext";
import { InvitationProvider } from "../components/InvitationContext";
import { AuthProvider } from "../lib/contexts/AuthContext";
import { SidebarProvider } from "../components/SidebarContext";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
        suppressHydrationWarning={true}
      >
            <AuthProvider>
              <SidebarProvider>
                <BrandProvider>
                  <BrandUserProvider>
                    <ProjectProvider>
                      <TaskProvider>
                        <SubtaskProvider>
                          <NotificationProvider>
                            <InvitationProvider>
                              {children}
                            </InvitationProvider>
                          </NotificationProvider>
                        </SubtaskProvider>
                      </TaskProvider>
                    </ProjectProvider>
                  </BrandUserProvider>
                </BrandProvider>
              </SidebarProvider>
            </AuthProvider>
      </body>
    </html>
  );
}
