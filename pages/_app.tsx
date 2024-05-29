import { ThemeProvider } from '../context/ThemeContext';
import '../app/globals.css';
import MainContainer from '../components/MainComponent';
import { AppProps } from 'next/app';
import React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  
  return (
    <ThemeProvider>
      <MainContainer>
        <Component {...pageProps} />
      </MainContainer>
    </ThemeProvider>
  );
}

export default MyApp;
