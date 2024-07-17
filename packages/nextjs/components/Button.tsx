import React from "react";
import Link from "next/link";

interface ButtonProps {
  text: string;
  type: "customizedBlack" | "customizedWhite";
  to: string;
}

const Button = ({ text, type, to }: ButtonProps) => {
  const commonClasses = "w-full rounded-xl text-center lg:px-2 lg:py-2 px-2 py-3 border shadow-md";

  switch (type) {
    case "customizedBlack":
      return (
        <Link
          href={to}
          className={`${commonClasses} bg-black text-white border-black hover:bg-opacity-90 hover:text-opacity-70`}
        >
          {text}
        </Link>
      );

    case "customizedWhite":
      return (
        <Link href={to} className={`${commonClasses} bg-white text-black border-black hover:text-opacity-70`}>
          {text}
        </Link>
      );

    default:
      return <p>No Link</p>;
  }
};

export default Button;
