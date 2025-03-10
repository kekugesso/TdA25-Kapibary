import React from "react";

type iconPropsType = {
  turn: "X" | "O";
  width: number | string;
  height: number | string;
  backgroundColor?: string;
  stroke?: string;
  strokeWidth?: number | string;
};

const Xicon = ({
  turn,
  width,
  height,
  backgroundColor,
  stroke = "#E31838",
  strokeWidth = "1",
  ...rest
}: iconPropsType) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M36.125 143.459L36.1216 143.462C28.1851 151.477 14.391 151.477 6.45445 143.462C-1.47453 135.455 -1.49765 122.252 6.46211 113.48L44.2299 75.3386L44.5783 74.9867L44.2299 74.6349L6.45445 36.4859C-1.48381 28.4691 -1.48581 14.5832 6.45441 6.51133C14.4445 -1.50478 28.1861 -1.50277 36.1216 6.51131L36.125 6.5147L74.635 44.6638L74.9869 45.0123L75.3388 44.6638L113.849 6.51471L113.852 6.51129C121.789 -1.50376 135.583 -1.50376 143.519 6.51129C151.459 14.5291 151.459 28.4681 143.519 36.4859L105.744 74.6349L105.396 74.9867L105.744 75.3386L143.519 113.488C151.459 121.505 151.459 135.444 143.519 143.462C135.583 151.477 121.789 151.477 113.852 143.462L113.849 143.459L75.3388 105.31L74.9869 104.961L74.635 105.31L36.125 143.459Z"
        fill={turn === "X" ? "#E31838" : backgroundColor || ""}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

const Oicon = ({
  turn,
  width,
  height,
  backgroundColor,
  stroke = "#0070BB",
  strokeWidth = "1",
  ...rest
}: iconPropsType) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 -5 158 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M78.9735 149.447C37.6036 149.447 4.5 116.343 4.5 74.9735C4.5 33.6066 38.2894 0.5 78.9735 0.5C120.396 0.5 153.447 33.6034 153.447 74.9735C153.447 116.343 120.343 149.447 78.9735 149.447ZM116.351 75.0265C116.351 54.5627 100.125 38.3909 79.7153 38.3909C59.2706 38.3909 42.3854 54.6002 43.0797 75.035C43.0841 95.4943 59.2548 111.662 79.7153 111.662C100.179 111.662 116.351 95.4899 116.351 75.0265Z"
        fill={turn === "O" ? "#0070BB" : backgroundColor || ""}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export { Xicon, Oicon };
