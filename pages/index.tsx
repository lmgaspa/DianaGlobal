import NavBar from '../components/NavBar';
import HomeComponent from '../components/HomeComponent';
import Why from '../components/Why';
import Explore from '../components/Explore';
import Footer from '../components/Footer';
import '../app/globals.css';
import StartPortfolio from '../components/StartPortfolio';

export default function Home() {
  return (
    <main>
      <NavBar />
      <HomeComponent />
      <Why />
      <Explore />
      <StartPortfolio />
      <Footer />
    </main>
  );
}