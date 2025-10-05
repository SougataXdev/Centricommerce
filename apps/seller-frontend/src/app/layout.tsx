import './global.css';
import { QueryClientProviderCmp } from './providers/QueryCprovider';

export const metadata = {
  title: 'Welcome to centricommerce seller portal',
  description: 'this is the seller portal for centricommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><QueryClientProviderCmp>{children}</QueryClientProviderCmp></body>
    </html>
  );
}
