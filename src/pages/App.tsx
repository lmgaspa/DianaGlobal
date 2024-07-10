import HomeComponent from '@/components/HomeAppComponent/HomeComponent';
import Why from '@/components/HomeAppComponent/Why';
import Explore from '@/components/HomeAppComponent/Explore';
import StartPortfolio from '@/components/HomeAppComponent/StartPortfolio';
import BuyTheMeme from '@/components/HomeAppComponent/BuyTheMeme';
import Popular from '@/components/HomeAppComponent/Popular';

const App: React.FC = () => {
    return (
    <main>
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

