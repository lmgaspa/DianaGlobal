import { ThemeProvider } from '@/context/ThemeContext';
import MainContainer from '@/components/GlobalComponent/MainComponent';
import { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from '@/components/ErrorBoundary';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
    };

    clearLocalStorage();
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ErrorBoundary>
          <MainContainer>
            <div className="overflow-hidden">
              <Component {...pageProps} />
            </div>
          </MainContainer>
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
