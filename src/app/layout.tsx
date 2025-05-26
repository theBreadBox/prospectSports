import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import WalletProvider from "../components/NextAbstractWalletProvider";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

// Update the Poppins font configuration
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
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
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased bg-[linear-gradient(to_bottom,#013538,black)] min-h-screen`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
