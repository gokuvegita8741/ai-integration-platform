import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Providers } from "@/components/providers";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Integration Platform",
  description: "Professional chatbot application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased font-sans`}
      >
        <MantineProvider
          theme={{
            primaryColor: 'indigo',
            defaultRadius: 'md',
            fontFamily: 'Outfit, Inter, system-ui, sans-serif',
            components: {
              Notification: {
                styles: {
                  root: {
                    background: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow:
                      '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                  },

                  title: {
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    letterSpacing: '0.01em',
                  },

                  description: {
                    color: '#a1a1aa', // zinc-400
                    fontSize: '13px',
                  },

                  icon: {
                    background: 'transparent',
                  },

                  closeButton: {
                    color: '#71717a',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                    },
                  },
                },
              },
            },
          }}
        >
          <Notifications />
          <Providers>{children}</Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
