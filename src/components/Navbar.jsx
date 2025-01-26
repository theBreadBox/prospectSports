'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { navVariants, planetVariants, slideIn, staggerContainer, textVariant, footerVariants, fadeIn } from '../utils/motion';

import { WagmiProvider, createConfig } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css'

import { abstractTestnet } from "wagmi/chains";
import { http } from "viem";
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: 'ProspectSports',
  projectId: '29f13c62ad6d6b8c041b3b191da90e77',
  chains: [abstractTestnet],
  transports: {
    [abstractTestnet.id]: http()
  }
});

const Navbar = () => {
  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      whileInView="show"
      className="sm:px-16 px-6 py-8 relative"
    >
      <div className="absolute w-[50%] inset-0 gradient-01" />
      <div className="2xl:max-w-[1280px] w-full mx-auto flex justify-between gap-8">
        <h2 className="font-extrabold text-[24px] leading-[30.24px] text-white">
          PROSPECT SPORTS
        </h2>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={{
                lightMode: {
                  colors: {
                    accentColor: '#00bcd4',
                    connectButtonBackground: '#00bcd4',
                    modalBackground: 'white',
                    modalText: 'black',
                  },
                },
                darkMode: {
                  colors: {
                    accentColor: '#00bcd4',
                    connectButtonBackground: '#00bcd4',
                    modalBackground: 'white',
                    modalText: 'black',
                  },
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 2,
                  delay: 0.5,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    return (
                      <div
                        {...(!mounted && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0.7,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!mounted || !account || !chain) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="w-[180px] py-2 text-white font-semibold text-center rounded-full bg-[#00bcd4] hover:bg-[#00acc1] transition-colors duration-200"
                                style={{
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                              >
                                Connect
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={openAccountModal}
                              className="w-[180px] py-2 text-white font-semibold text-center rounded-full bg-[#00bcd4] hover:bg-[#00acc1] transition-colors duration-200"
                              style={{
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            >
                              {account.displayName}
                            </button>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </motion.div>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    </motion.nav>
  );
};

export default Navbar;