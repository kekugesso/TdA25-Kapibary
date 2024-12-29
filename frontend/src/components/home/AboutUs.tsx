"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export default function AboutUs() {
  const { theme } = useTheme();

  return (
    <article id="about-us" className="flex flex-col flex-center">
      <Image
        src={
          theme == "light"
            ? "/img/logo_blue_large_black.svg"
            : "/img/logo_blue_large_white.svg"
        }
        alt="Site logo"
        height={300}
        width={400}
        loading="eager"
        className="flex flex-center text-gray-500 min-h-[100px] min-w-[100px] md:min-h-[300px] md:min-w-[400px] p-4"
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
