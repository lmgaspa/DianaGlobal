import NavBar from '../components/NavBar';
import HomeComponent from '../components/HomeComponent';
import Why from '../components/Why';
import Explore from '../components/Explore';
import Footer from '../components/Footer';
import StartPortfolio from '../components/StartPortfolio';
import '../app/globals.css';

const App: React.FC = () => {
    return (
        <main>
            <NavBar />
            <HomeComponent />
            <Why />
            <Explore />
            <StartPortfolio />
            <Footer />
        </main>
    )
}

export default App