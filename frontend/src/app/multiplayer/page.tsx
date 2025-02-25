"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type button = {
  text: string;
  onClick: () => void;
};

function GameType({
  title,
  description,
  image,
  imageClassName,
  redbutton,
  bluebutton,
}: {
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
  redbutton: button;
  bluebutton: button;
}) {
  return (
    <div className="flex flex-col flex-center space-y-4 px-[10%] text-center h-full w-full">
      <h1 className="font-bold text-xl">{title}</h1>
      <p className="font-bold text-lg mt-4 h-[100px]">{description}</p>
      <Image
        src={image}
        height={150}
        width={150}
        alt="Game Type Image"
        className={
          "w-[150px] h-[150px]" + (imageClassName ? ` ${imageClassName}` : "")
        }
      />
      <button
        onClick={redbutton.onClick}
        className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 w-full rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        {redbutton.text}
      </button>
      <button
        onClick={bluebutton.onClick}
        className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 w-full rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        {bluebutton.text}
      </button>
    </div>
  );
}

export default function MultiplayerLobby() {
  const router = useRouter();
  const createGame = () => {
    // create game logic
  };
  const joinGame = () => {
    // join game logic
  };
  const findGame = () => {
    // find game logic
  };

  return (
    <article className="flex flex-center flex-col space-y-5 py-[5%] ">
      <h1 className="font-bold text-3xl">
        Najděte soupeře a pusťte se do hry!
      </h1>
      <h2 className="font-bold text-lg">
        Vyberte svůj způsob hry a užijte si piškvorky naplno!
      </h2>
      <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0">
        <GameType
          title="Hrajte s přáteli"
          description="Vytvořte soukromou místnost a pozvěte kamaráda pomocí jedinečného odkazu. Ukažte, kdo je v piškvorkách nejlepší!"
          image="/img/bulb_highfive.svg"
          imageClassName="h-[150px] w-[200px]"
          redbutton={{ text: "Vytvořit hru s přáteli", onClick: createGame }}
          bluebutton={{ text: "Připojit se do hry", onClick: joinGame }}
        />
        <GameType
          title="Matchmaking"
          description="Klikněte a utekejte se s náhodným hráčem. Soutěžte spolu a postupujte v žebříčku. Každá hra se počítá!"
          image="/img/bulb_play.svg"
          redbutton={{ text: "Najít hru", onClick: findGame }}
          bluebutton={{
            text: "Žebříček",
            onClick: () => router.push("/leaderboard"),
          }}
        />
      </div>
    </article>
  );
}
