import Head from "next/head";
import HomeComponent from "@/components/HomeAppComponent/HomeComponent";
import Why from "@/components/HomeAppComponent/Why";
import Explore from "@/components/HomeAppComponent/Explore";
import StartPortfolio from "@/components/HomeAppComponent/StartPortfolio";
import BuyTheMeme from "@/components/HomeAppComponent/BuyTheMeme";
import Popular from "@/components/HomeAppComponent/Popular";

const SITE_URL = "https://www.dianaglobal.com.br"; // ajuste

const App: React.FC = () => {
  return (
    <main>
      <Head>
        {/* Basic */}
        <title>Diana Global</title>
        <meta
          name="description"
          content="Diana Global — a Cryptocurrency Exchange project."
        />
        <link rel="canonical" href={SITE_URL} />

        {/* Favicon & icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme (light/dark) */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />

        {/* Open Graph */}
        <meta property="og:site_name" content="Diana Global" />
        <meta property="og:title" content="Diana Global" />
        <meta
          property="og:description"
          content="Diana Global — a Cryptocurrency Exchange project."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Diana Global" />
        <meta
          name="twitter:description"
          content="Diana Global — a Cryptocurrency Exchange project."
        />
        <meta name="twitter:image" content="/og-image.png" />

        {/* Robots */}
        <meta name="robots" content="index,follow" />

        {/* Viewport (se não estiver em _document) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <HomeComponent />
      <Why />
      <Explore />
      <Popular />
      <StartPortfolio />
      <BuyTheMeme />
    </main>
  );
};

export default App;
