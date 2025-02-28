import Image from "next/image";

type button = {
  text: string;
  onClick: () => void;
};

export default function GameTypeCard({
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
      <h1 className="font-bold text-3xl m-4">{title}</h1>
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
