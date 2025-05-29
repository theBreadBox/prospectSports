import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import WalletProvider from "../components/NextAbstractWalletProvider";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletDisplay from "../components/WalletDisplay";
import WalletStatusCheck from "../components/WalletStatusCheck";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prospect - Connect Wallet",
  description: "Connect your wallet to register for Prospect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="bg-[#001118] min-h-screen">
        <WalletProvider>
          <Header />
          <WalletDisplay />
          <WalletStatusCheck />
          <main className="pt-[120px] md:pt-[140px]">
            {children}
          </main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
