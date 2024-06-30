import { ThemeProvider } from '../context/ThemeContext';
import MainContainer from '../components/GlobalComponent/MainComponent';
import { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { SessionProvider } from "next-auth/react";
import '../styles/globals.css';

function MyApp({ Component, pageProps: session, ...pageProps }: AppProps) {
  // Função para limpar o localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  };

  // Efeito para limpar o localStorage ao montar o componente
  useEffect(() => {
    clearLocalStorage();
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <MainContainer>
          <div className="overflow-hidden" />
          <Component {...pageProps} />
        </MainContainer>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;

