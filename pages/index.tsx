import App from "./App";
import CoinsPriceProvider from "../components/CryptoTracker/PriceCoins";
import { PriceChangeProvider } from "../components/CryptoTracker/PriceChange";

export default function Home() {
  return (
    <CoinsPriceProvider>
      <PriceChangeProvider>
        <App />
      </PriceChangeProvider>
    </CoinsPriceProvider>
  );
}
