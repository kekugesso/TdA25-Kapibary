import Image from "next/image";
import FeatureItem from "@/components/home/types";

export default function SiteFeatures() {
  const items: FeatureItem[] = [
    {
      img: { src: "/img/bulb_think.svg", alt: "Bulb Think" },
      title: "Výzvy pro začátečníky i experty",
      detail:
        "Od jednoduchých her pro nováčky až po strategické pro experty – zvolte si svou obtížnost.",
    },
    {
      img: { src: "/img/bulb_play.svg", alt: "Bulb Play" },
      title: "Hrajte proti přátelům na jednom zařízení",
      detail:
        "Užijte si lokální multiplayer a soutěžte s přáteli v piškvorkách na jednom zařízení.",
    },
    {
      img: { src: "/img/bulb_idea.svg", alt: "Bulb Idea" },
      title: "Hrajte a zdokonalujte své dovednosti",
      detail:
        "Ponořte se do světa piškvorkových hlavolamů ještě dnes a posouvejte své schopnosti na novou úroveň.",
    },
  ];

  return (
    <article id="site-features">
      <div className="flex flex-col flex-center text-center text-balance p-4 md:pt-24 md:px-24">
        <h1 className="font-semibold text-3xl mb-5 leading-9">
          Připojte se k zábavě a vyzvěte svou mysl
        </h1>
        <p>
          Naše platforma nabízí mladým lidem poutavý způsob, jak zlepšit jejich
          logické myšlení. Díky uživatelsky přívětivým funkcím je začátek
          snadný.
        </p>
      </div>
      <div className="flex flex-col justify-stretch justify-items-stretch gap-6 p-4 md:p-16 text-balance text-center sm:flex-row">
        {items.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center p-4">
            <Image
              {...item.img}
              width={50}
              height={50}
              className="flex flex-center text-gray-500 min-w-[50px] min-h-[50px]"
              loading="eager"
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
    </article>
  );
}
