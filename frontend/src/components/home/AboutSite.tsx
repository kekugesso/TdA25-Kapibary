import Image from "next/image";

export default function AboutSite() {
  return (
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
  );
}
