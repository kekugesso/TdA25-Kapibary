import Image from "next/image";

export default function AboutUs() {
  return (
    <article id="about-us" className="flex flex-col flex-center">
      <Image
        src="/img/logo-large.png"
        alt="Site logo"
        height={300}
        width={300}
        // loading="eager"
        className="flex flex-center text-gray-500 min-h-[100px] min-w-[100px] md:min-h-[300px] md:min-w-[300px]"
      />
      <div className="flex flex-col gap-4 text-center p-4 md:text-left md:grid md:grid-cols-2 md:p-24">
        <h1 className="flex flex-center font-semibold text-2xl text-center md:text-left">
          Posilte svou mysl pomocí piškvorek
        </h1>
        <p>
          Naše platforma nabízí dětem a mládeži zábavný a poutavý způsob, jak
          zlepšit jejich logické a taktické myšlení. Řešením piškvorek mohou
          uživatelé v hravém prostředí rozvíjet schopnosti kritického řešení
          problémů. Připojte se k nám a podporujte kreativitu a strategické
          myšlení prostřednictvím interaktivní hry.
        </p>
      </div>
    </article>
  );
}
