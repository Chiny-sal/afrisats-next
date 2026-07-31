import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: {
    default: "AfriSats - Lightning Marketplace for Africa",
    template: "%s | AfriSats",
  },
  description:
    "Buy digital services and physical goods from African creators with Bitcoin Lightning payments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-body antialiased">
        <ToastProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
