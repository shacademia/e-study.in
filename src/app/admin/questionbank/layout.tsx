import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Bank",
  description: "Question Bank for managing the application",
  
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
