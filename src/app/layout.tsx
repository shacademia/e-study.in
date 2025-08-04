import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from "next";
import { ClientAuthProvider } from '@/components/ClientAuthProvider';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import "./globals.css";
import { ResultContextProvider } from '@/context/ResultContext';
import { QuestionContextProvider } from "@/context/QuestionContext";
import { UsedQuestionsProvider } from '@/contexts/UsedQuestionsContext';
export const metadata: Metadata = {
  title: "SH Academia",
  description: "SH Academia is a comprehensive platform for managing educational content, including question banks, exams, and student results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ReactQueryProvider>
          <ClientAuthProvider>
            <ResultContextProvider>
              <QuestionContextProvider>
                <UsedQuestionsProvider>
                  {children}
                  <SpeedInsights />
                </UsedQuestionsProvider>
              </QuestionContextProvider>
            </ResultContextProvider>
          </ClientAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
