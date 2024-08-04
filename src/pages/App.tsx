import Head from 'next/head';
import HomeComponent from '@/components/HomeAppComponent/HomeComponent';
import Why from '@/components/HomeAppComponent/Why';
import Explore from '@/components/HomeAppComponent/Explore';
import StartPortfolio from '@/components/HomeAppComponent/StartPortfolio';
import BuyTheMeme from '@/components/HomeAppComponent/BuyTheMeme';
import Popular from '@/components/HomeAppComponent/Popular';

const App: React.FC = () => {
    return (
    <main>
         <Head>
                <title>Diana Global</title>
                <meta name="description" content="A Diana Global a CryptoCurrency Project Exchange" />
            </Head>
        <HomeComponent />
        <Why />
        <Explore />
        <Popular />
        <StartPortfolio />
        <BuyTheMeme />
    </main>
    )
}

export default App

