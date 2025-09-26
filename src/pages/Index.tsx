import Header from "@/components/Header";
import BreakingNews from "@/components/BreakingNews";
import LocalMandi from "@/components/LocalMandi";
import PoliticsNews from "@/components/PoliticsNews";
import Categories from "@/components/Categories";
import BusinessNews from "@/components/BusinessNews";
import SportsSection from "@/components/SportsSection";
import Footer from "@/components/Footer";
import TechAndEntertainmentNews from "@/components/TechandEntertainmentNews";
import Newspaper from "./Newspaper";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <BreakingNews />
        <LocalMandi />
        <PoliticsNews />
        <Newspaper />
        <Categories />
        <BusinessNews />
        <TechAndEntertainmentNews />
        <SportsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;