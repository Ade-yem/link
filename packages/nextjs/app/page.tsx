"use client";

import Hero from "./components/Hero";
import type { NextPage } from "next";

// import { useAccount } from "wagmi";
// import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <Hero />
    </>
  );
};

export default Home;
