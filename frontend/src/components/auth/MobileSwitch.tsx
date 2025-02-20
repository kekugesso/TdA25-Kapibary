export default function MobileSwitch({
  mode,
  setModeAction,
}: {
  mode: boolean;
  setModeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex md:hidden mb-8">
      <button
        onClick={() => {
          setModeAction(false);
        }}
        className={`text-xl font-bold pb-2 border-b-2 transition-colors ${
          !mode ? "border-blue-500" : "border-transparent text-gray-400"
        }`}
      >
        Přihlášení
      </button>
      <button
        onClick={() => {
          setModeAction(true);
        }}
        className={`ml-8 text-xl font-bold pb-2 border-b-2 transition-colors ${
          mode ? "border-blue-500" : "border-transparent text-gray-400"
        }`}
      >
        Registrace
      </button>
    </div>
  );
}
