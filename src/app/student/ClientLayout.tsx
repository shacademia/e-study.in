'use client';

import StudentAuthGuard from "./StudentAuthGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <StudentAuthGuard>{children}</StudentAuthGuard>;
}
