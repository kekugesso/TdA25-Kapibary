"use client";

import { useState } from "react";
import Link from "next/link";

export default function Greeter() {
  const [buttonClick, setButtonClick] = useState(false);

  const gradient =
    "bg-gradient-to-r from-red-light dark:from-red-dark to-blue-light dark:to-blue-dark";

  return (
    <article
      id="greeter"
      className="flex flex-col flex-center h-[calc(100dvh-var(--navbar-height))] text-center text-balance bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(#00000081, #00000080), url('/img/landing_page.png')",
      }}
    >
      <h1
        className={`font-semibold text-5xl mb-5 px-4 md:max-w-[60%] leading-[60px] text-white ${buttonClick && "animate-fade-up animate-duration-[500ms] animate-ease-in-out"}`}
      >
        {buttonClick
          ? "Jste připraveni ponořit se do hry?"
          : "Rozvíjejte svou mysl s piškvorkovými hádankami"}
      </h1>
      <p
        className={`font-medium text-xl px-4 md:max-w-[70%] leading-[25px] text-white ${buttonClick && "animate-fade-up animate-duration-[500ms] animate-ease-in-out"}`}
      >
        {buttonClick
          ? "Vyberte si, kam chcete pokračovat. Můžete zahájit novou hru a rovnou se pustit do akce, nebo si prohlédnout seznam zajímavých rozehraných her. Stačí si vybrat!"
          : "Vítejte na inovativní platformě Think different Academy, kde se zábava setkává se strategií! Zapojte se do vzrušujících piškvorkových hádanek, jejichž cílem je zdokonalit vaše logické a taktické myšlení."}
      </p>

      <div className="mt-5 text-2xl flex items-center justify-center font-semibold text-white space-x-5">
        <Link
          className={`bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
            buttonClick
              ? "bg-red-light dark:bg-red-dark"
              : gradient +
                " from-85% translate-x-[50%] opacity-0 pointer-events-none"
          }`}
          href={"/game"}
        >
          Nová hra
        </Link>
        <button
          className={`${
            buttonClick ? "opacity-0 pointer-events-none hidden" : "opacity-100"
          } text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 z-10 ${gradient}`}
          onClick={() => setButtonClick(true)}
        >
          Hrát
        </button>

        <Link
          className={`bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
            buttonClick
              ? "bg-blue-light dark:bg-blue-dark"
              : gradient +
                " to-15% -translate-x-[50%] opacity-0 pointer-events-none"
          }`}
          href={"/games"}
        >
          Seznam her
        </Link>
      </div>
    </article>
  );
}
