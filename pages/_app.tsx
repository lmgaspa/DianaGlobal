import { ThemeProvider } from '../context/ThemeContext';
import MainContainer from '../components/GlobalComponent/MainComponent';
import { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { SessionProvider } from "next-auth/react";
import '../styles/globals.css';

function MyApp({ Component, pageProps: session, ...pageProps }: AppProps) {
  // Função para limpar o localStorage ao montar o componente
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
        <MainContainer>
          {/* Garante que o MainContainer tenha estilos e comportamentos globais */}
          <div className="overflow-hidden" />
          {/* Renderiza o Componente da página atual */}
          <Component {...pageProps} />
        </MainContainer>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
