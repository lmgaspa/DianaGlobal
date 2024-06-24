import { ThemeProvider } from '../context/ThemeContext';
import MainContainer from '../components/GlobalComponent/MainComponent';
import { AppProps } from 'next/app';
import React from 'react';
import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'

function MyApp({ Component, pageProps: session, ...pageProps }: AppProps) {
  
  return (
    <SessionProvider session={session}>
    <ThemeProvider>
      <MainContainer>
        <Component {...pageProps} />
      </MainContainer>
    </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
