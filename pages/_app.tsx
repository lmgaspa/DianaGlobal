import { ThemeProvider } from '../context/ThemeContext';
import '../app/globals.css';
import MainContainer from '../components/MainComponent';
import { AppProps } from 'next/app';

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
