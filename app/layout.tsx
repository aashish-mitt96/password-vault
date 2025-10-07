import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'Password Vault' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full bg-gray-50">
        {children}
      </body>
    </html>
  );
}