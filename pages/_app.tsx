import '../app/globals.css';
import MainContainer from '../components/MainComponent';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainContainer>
      <Component {...pageProps} />
    </MainContainer>
  );
}

export default MyApp;
