import HomeComponent from '../components/HomeAppComponent/HomeComponent';
import Why from '../components/HomeAppComponent/Why';
import Explore from '../components/HomeAppComponent/Explore';
import StartPortfolio from '../components/HomeAppComponent/StartPortfolio';
import '../app/globals.css';
import BuyTheMeme from '@/components/HomeAppComponent/BuyTheMeme';

const App: React.FC = () => {
    return (
    <main>
        <HomeComponent />
        <Why />
        <Explore />
        <StartPortfolio />
        <BuyTheMeme />
    </main>
    )
}

export default App

