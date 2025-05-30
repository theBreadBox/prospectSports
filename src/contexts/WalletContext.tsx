"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

interface WalletContextType {
  // Basic wallet context properties
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    // Implement wallet connection logic here
    console.log('Connecting wallet...');
    // Placeholder implementation
    setAddress('0x1234567890123456789012345678901234567890');
    setIsConnected(true);
  };

  const disconnect = () => {
    // Implement wallet disconnection logic here
    console.log('Disconnecting wallet...');
    setAddress(null);
    setIsConnected(false);
  };

  const value: WalletContextType = {
    address,
    isConnected,
    connect,
    disconnect,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 