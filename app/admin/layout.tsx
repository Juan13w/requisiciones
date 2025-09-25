'use client';

import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Toaster } from '@/components/ui/sonner';
import { Inter } from 'next/font/google';
import './admin.css';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-background`}>
      <div className="flex min-h-screen flex-col">
        <AdminNavbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
