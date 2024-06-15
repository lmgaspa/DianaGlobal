import { ThemeProvider } from '../context/ThemeContext';
import '../app/globals.css';
import MainContainer from '../components/MainComponent';
import { AppProps } from 'next/app';
import React from 'react';
import { SessionProvider } from "next-auth/react"

function MyApp({ Component, pageProps: session, ...pageProps }: AppProps) {
  
  return (
    <SessionProvider session={session} basePath="/api/auth">
    <ThemeProvider>
      <MainContainer>
        <Component {...pageProps} />
      </MainContainer>
    </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
