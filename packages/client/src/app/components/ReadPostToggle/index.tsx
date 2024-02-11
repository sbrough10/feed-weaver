import React from "react";

export const unreadIcon = (
  <svg
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    width="40px"
    height="40px"
    fill="white"
  >
    <path d="M 46.3 129.5 C 42.1 126.5 44.2 125 52.6 125 L 447.4 125 C 455.8 125 457.9 126.5 453.7 129.5 L 256.3 270.5 C 252.1 273.5 247.9 273.5 243.7 270.5 Z M 460 365 C 460 370.523 455.523 375 450 375 L 50 375 C 44.477 375 40 370.523 40 365 L 40 135.484 L 243.265 282.563 C 247.754 285.812 252.244 285.812 256.734 282.563 L 460 135.484 Z" />
  </svg>
);

export const readIcon = (
  <svg
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    width="40px"
    height="40px"
    fill="white"
  >
    <path d="M 460 437.313 C 460 442.836 455.523 447.313 450 447.313 L 50 447.313 C 44.477 447.313 40 442.836 40 437.313 L 40 207.797 L 243.265 354.876 C 247.754 358.125 252.244 358.125 256.734 354.876 L 460 207.797 Z M 46.3 201.813 C 45.139 200.984 44.46 200.269 44.261 199.669 C 42.383 198.942 42.677 197.698 45.143 195.936 L 242.543 54.936 C 246.743 51.936 250.943 51.936 255.143 54.936 L 452.543 195.936 C 453.704 196.765 454.383 197.48 454.582 198.08 C 456.46 198.807 456.166 200.051 453.7 201.813 L 256.3 342.813 C 252.1 345.813 247.9 345.813 243.7 342.813 Z" />
  </svg>
);

interface ReadPostToggleProps {
  isRead: boolean;
  onClick: () => void;
}

export const ReadPostToggle: React.FC<ReadPostToggleProps> = ({
  isRead,
  onClick,
}) => {
  return <a onClick={onClick}>{isRead ? readIcon : unreadIcon}</a>;
};
