"use client";

import Popover from "@/components/Popover";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

export default function Home() {
  const router = useRouter();

  const changePath = (path: string) => router.push(path);

  const [buttonClick, setButtonClick] = useState(false);

  return (
    <section>
      <article
        id="greater"
        className="flex flex-col flex-center h-[calc(100dvh-var(--navbar-height))] text-center text-balance"
      >
        <h1 className="font-semibold text-5xl mb-5 px-4 md:max-w-[60%] leading-[60px]">
          {buttonClick
            ? "Jste připraveni ponořit se do hry?"
            : "Rozvíjejte svou mysl s piškvorkovými hádankami"}
        </h1>
        <p className="font-medium text-xl px-4 md:max-w-[70%] leading-[25px]">
          {buttonClick
            ? "Vyberte si, kam chcete pokračovat. Můžete zahájit novou hru a rovnou se pustit do akce, nebo si prohlédnout seznam zajímavých rozehraných her. Stačí si vybrat!"
            : "Vítejte na inovativní platformě Think different Academy, kde se zábava setkává se strategií! Zapojte se do vzrušujících piškvorkových hádanek, jejichž cílem je zdokonalit vaše logické a taktické myšlení."}
        </p>
        <div className="mt-5 text-2xl flex items-center justify-center font-semibold text-white space-x-5">
          <GameButton
            changePath={changePath}
            isClicked={buttonClick}
            setIsClicked={setButtonClick}
          />
        </div>
      </article>
      <article
        id="about-site"
        className="flex flex-col flex-center gap-5 p-4 text-center md:text-left text-balance md:p-16 lg:px-32 sm:flex-row"
      >
        <div>
          <h1 className="font-semibold text-3xl mb-5 leading-9 text-center md:text-left ">
            Prozkoumejte naše poutavé hádanky a bavte se!
          </h1>
          <p>
            Ponořte se do světa strategické zábavy s naší interaktivní herní
            deskou. Snadno se dostanete k různým hádankám navrženým tak, abyste
            zlepšili své schopnosti logického myšlení.
          </p>
        </div>
        <Image
          src="/img/about-site.png"
          alt="Site picture"
          height={500}
          width={500}
          // loading="eager"
          className="flex flex-center text-gray-500 bg-white-darker min-h-[300px] min-w-[300px] md:min-h-[500px] md:min-w-[500px]"
        />
      </article>
      <article id="site-features">
        <div className="flex flex-col flex-center text-center text-balance p-4 md:pt-24 md:px-24">
          <h1 className="font-semibold text-3xl mb-5 leading-9">
            Připojte se k zábavě a vyzvěte svou mysl
          </h1>
          <p>
            Naše platforma nabízí mladým lidem poutavý způsob, jak zlepšit
            jejich logické myšlení. Díky uživatelsky přívětivým funkcím je
            začátek snadný.
          </p>
        </div>
        <SiteFeatures />
      </article>
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
    </section>
  );
}

function GameButton({
  changePath,
  isClicked,
  setIsClicked,
}: {
  changePath: CallableFunction;
  isClicked: boolean;
  setIsClicked: Dispatch<SetStateAction<boolean>>;
}) {
  const gradient =
    "bg-gradient-to-r from-red-light dark:from-red-dark to-blue-light dark:to-blue-dark";

  return (
    <>
      <Popover content="Link to '/new-game'" disabled={!isClicked}>
        <button
          className={`bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
            isClicked
              ? "bg-red-light dark:bg-red-dark"
              : gradient + " from-85% translate-x-[50%] opacity-0"
          }`}
          disabled={!isClicked}
          onClick={() => changePath("/new-game")}
        >
          Nová hra
        </button>
      </Popover>
      <button
        className={`${
          isClicked ? "opacity-0 pointer-events-none hidden" : "opacity-100"
        } text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 z-10 ${gradient}`}
        onClick={() => setIsClicked(true)}
      >
        Hrát
      </button>

      <Popover content="Link to '/games'" disabled={!isClicked}>
        <button
          className={`bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
            isClicked
              ? "bg-blue-light dark:bg-blue-dark"
              : gradient + " to-15% -translate-x-[50%] opacity-0"
          }`}
          disabled={!isClicked}
          onClick={() => changePath("/games")}
        >
          Seznam her
        </button>
      </Popover>
    </>
  );
}

type FeatureItem = {
  readonly img: { src: string; alt: string };
  readonly title: string;
  readonly detail: string;
};

function SiteFeatures() {
  const items: FeatureItem[] = [
    {
      img: { src: "/img/f1", alt: "Bulb Think" },
      title: "Výzvy pro začátečníky i experty",
      detail:
        "Od jednoduchých her pro nováčky až po strategické pro experty – zvolte si svou obtížnost.",
    },
    {
      img: { src: "/img/f2", alt: "Bulb Play" },
      title: "Hrajte proti přátelům na jednom zařízení",
      detail:
        "Užijte si lokální multiplayer a soutěžte s přáteli v piškvorkách na jednom zařízení.",
    },
    {
      img: { src: "/img/f3", alt: "Bulb Idea" },
      title: "Hrajte a zdokonalujte své dovednosti",
      detail:
        "Ponořte se do světa piškvorkových hlavolamů ještě dnes a posouvejte své schopnosti na novou úroveň.",
    },
  ];

  return (
    <div className="flex flex-col justify-stretch justify-items-stretch gap-6 p-4 md:p-16 text-balance text-center sm:flex-row">
      {items.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center p-4">
          <Image
            {...item.img}
            width={50}
            height={50}
            className="flex flex-center text-gray-500"
            /* loading="eager" */
          />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
