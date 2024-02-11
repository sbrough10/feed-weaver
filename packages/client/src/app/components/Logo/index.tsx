import React, { CSSProperties } from "react";

const logoStyle = (stroke: string): CSSProperties => ({
  stroke,
  strokeLinecap: "round",
  fill: "none",
  strokeWidth: "30px",
});

const darkGreen = "#027c04";
const lightGreen = "#02c106";

export const Logo: React.FC = () => {
  return (
    <svg
      width="40px"
      height="40px"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        style={logoStyle(darkGreen)}
        d="M 187.633 440.367 C 166.715 399.347 131.554 380.773 174.061 329.416 C 224.86 268.041 164.745 226.507 164.745 226.507"
      />
      <path
        style={logoStyle(lightGreen)}
        d="M 184.378 226.615 C 167.009 278.284 153.032 295.633 174.057 338.472 C 201.774 394.947 168.283 443.651 168.283 443.651"
        transform="matrix(-1, 0, 0, -1, 348.522095, 670.265991)"
      />
      <path
        style={logoStyle(lightGreen)}
        d="M 179.763 226.864 L 323.569 228.062"
      />
      <path
        style={logoStyle(darkGreen)}
        d="M 187.601 439.743 C 174.449 413.952 155.666 397.034 154.098 375.262"
      />
      <path
        style={logoStyle(darkGreen)}
        d="M 193.992 278.325 C 191.315 247.733 164.499 229.205 164.499 229.205"
      />
      <path
        style={logoStyle(darkGreen)}
        d="M 164.532 229.101 L 165.047 73.338 L 343.694 74.9"
      />
    </svg>
  );
};
