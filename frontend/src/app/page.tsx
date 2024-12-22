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
    <main>
      <div
        id="greater"
        className="flex flex-col flex-center h-[calc(100dvh-var(--navbar-height))] text-center text-balance"
      >
        <h1 className="font-semibold text-5xl mb-5 max-w-[60%] leading-[60px]">
          {buttonClick
            ? "Jste připraveni ponořit se do hry?"
            : "Rozvíjejte svou mysl s piškvorkovými hádankami"}
        </h1>
        <p className="font-medium text-xl max-w-[70%] leading-[25px]">
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
      </div>
      <div
        id="about-site"
        className="flex flex-center text-center text-balance space-x-5 p-16"
      >
        <div className="flex flex-col flex-center text-balance text-left">
          <h1 className="font-semibold text-3xl mb-5 leading-9">
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
          className="bg-white-darker min-h-[500px] min-w-[500px]"
          loading="eager"
        />
      </div>
      <div id="site-features">
        <div className="flex flex-col flex-center text-center text-balance pt-24 px-24">
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
      </div>
      <div id="about-us"></div>
    </main>
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

interface FeatureItem {
  readonly img: string;
  readonly title: string;
  readonly detail: string;
}

function SiteFeatures() {
  const items: FeatureItem[] = [
    {
      img: "/img/f1", // Example image source
      title: "Výzvy pro začátečníky i experty",
      detail:
        "Od jednoduchých her pro nováčky až po strategické pro experty – zvolte si svou obtížnost.",
    },
    {
      img: "/img/f2",
      title: "Hrajte proti přátelům na jednom zařízení",
      detail:
        "Užijte si lokální multiplayer a soutěžte s přáteli v piškvorkách na jednom zařízení.",
    },
    {
      img: "/img/f3",
      title: "Hrajte a zdokonalujte své dovednosti",
      detail:
        "Ponořte se do světa piškvorkových hlavolamů ještě dnes a posouvejte své schopnosti na novou úroveň.",
    },
  ];

  return (
    <div className="flex flex-row justify-stretch justify-items-stretch gap-6 p-6">
      {items.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center p-4">
          <Image
            src={item.img}
            alt={item.title}
            width={50}
            height={50}
            className=""
          />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
