import Navbar from "../Components/Home/NavBar";
import Hero from "../Components/Home/Hero";
import CollectionCard from "../Components/Home/CollectionCard";
import ProductCard from "../Components/Home/ProductCard";
import OurStory from "../Components/Home/OurStory";
import Footer from "../Components/Home/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CollectionCard />
      <ProductCard />
      <OurStory />
      <Footer />
    </>
  );
}