import Greeter from "@/components/home/Greeter";
import AboutSite from "@/components/home/AboutSite";
import SiteFeatures from "@/components/home/SiteFeatures";
import AboutUs from "@/components/home/AboutUs";

export default function Home() {
  return (
    <section>
      <Greeter />
      <AboutSite />
      <SiteFeatures />
      <AboutUs />
    </section>
  );
}
