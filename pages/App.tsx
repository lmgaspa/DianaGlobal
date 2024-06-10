import HomeComponent from '../components/HomeComponent';
import Why from '../components/Why';
import Explore from '../components/Explore';
import StartPortfolio from '../components/StartPortfolio';
import '../app/globals.css';
import BuyTheMeme from '@/components/BuyTheMeme';

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

